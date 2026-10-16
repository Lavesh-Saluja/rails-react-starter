# syntax=docker/dockerfile:1
# check=error=true

# Production image for the Rails API. Local development does not use Docker.
# Build and run (from the repository root):
#   docker build -t starter-api .
#   docker run --rm -p 3000:3000 -e DATABASE_URL=... -e SECRET_KEY_BASE=... starter-api
# Run migrations once per deploy, not on every container start:
#   docker run --rm -e DATABASE_URL=... -e SECRET_KEY_BASE=... starter-api ./bin/rails db:migrate

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version
ARG RUBY_VERSION=3.3.10
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

# Rails app lives here
WORKDIR /rails

# Install base packages
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 postgresql-client && \
    ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Set production environment variables and enable jemalloc for reduced memory usage and latency.
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development:test" \
    LD_PRELOAD="/usr/local/lib/libjemalloc.so"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build gems
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libpq-dev libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install application gems
COPY Gemfile Gemfile.lock ./

RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    # -j 1 disable parallel compilation to avoid a QEMU bug: https://github.com/rails/bootsnap/issues/495
    bundle exec bootsnap precompile -j 1 --gemfile

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times.
# -j 1 disable parallel compilation to avoid a QEMU bug: https://github.com/rails/bootsnap/issues/495
RUN bundle exec bootsnap precompile -j 1 app/ lib/




# Final stage for app image
FROM base

# Run and own only the runtime files as a non-root user for security
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash
USER 1000:1000

# Copy built artifacts: gems, application
COPY --chown=rails:rails --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --chown=rails:rails --from=build /rails /rails

# Commit SHA the image was built from, reported by /api/health/live so a deploy can be verified.
ARG APP_REVISION=""
ENV APP_REVISION="${APP_REVISION}"

# Entrypoint only execs the command; migrations run as a separate one-off step.
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD curl -fsS "http://localhost:${PORT:-3000}/api/health/live" || exit 1
CMD ["./bin/rails", "server"]
