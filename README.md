# Rails + React Starter

A small, reusable foundation for short (≈ two-day) web application assignments: a Rails
API and a React frontend in one repository, with PostgreSQL, tests, linting, Git hooks,
CI and a production Docker image — so the time goes into the assignment, not the setup.

It ships with one demonstration feature (`SampleItem` CRUD with list and detail pages)
and two health endpoints. Replace the sample with your real feature
(see [Replacing the sample feature](#20-replacing-the-sample-feature)).

**Starting a new project:** on GitHub click **Use this template → Create a new repository**,
clone it, then rename `app_name` in `config/database.yml`, the Render services in
`render.yaml` (section 17) and the app title in
`app/javascript/src/translations/en.json`.

> **Not a secure multi-user app.** The sample has no authentication or authorization.
> See [Security limitations](#21-security-limitations).

---

## Contents

2. [Architecture](#2-architecture) · 3. [Stack and versions](#3-stack-and-versions) ·
3. [Prerequisites](#4-prerequisites) · 5. [Repository structure](#5-repository-structure) ·
   5a. [Backend conventions](#5a-backend-conventions) · 5b. [Frontend conventions](#5b-frontend-conventions) · 6. [Quick start](#6-quick-start-native) ·
4. [PostgreSQL](#7-postgresql-installation-and-configuration) ·
5. [Optional Docker database](#8-optional-docker-compose-database) · 9. [Running the app](#9-running-rails-and-react) ·
6. [Environment variables](#10-environment-variables) · 11. [Database commands](#11-database-commands) ·
   12–14. [Tests and linting](#12-14-tests-and-linting) · 15. [Git hooks](#15-git-hooks) ·
7. [CI](#16-github-actions-ci) · 17. [Deployment](#17-deployment) · 18. [Health checks](#18-health-checks) ·
8. [Troubleshooting](#19-troubleshooting) · 20. [Replacing the sample](#20-replacing-the-sample-feature) ·
9. [Security limitations](#21-security-limitations) · 22. [Known limitations](#22-known-limitations-and-manual-steps)

---

## 2. Architecture

```
 Development (no Docker needed)                    Production (Render, render.yaml)

 Browser ──► Vite :5173 ──/api/*──► Rails :3000     Browser ──► Render static site (dist/)
             (React app)   proxy     (API only)        │
                                        │              └──https──► Render web service ──► Render
                                        ▼                          (Docker image)          PostgreSQL
                                   PostgreSQL                       CORS_ORIGINS = frontend origin
```

- One repository, Rails at the root (as in a standard Rails app). The React app lives in
  `app/javascript/` and is built by Vite; Rails itself is API-only and serves JSON under `/api/*`
  (controller → Pundit policy → service → Jbuilder view; see [Backend conventions](#5a-backend-conventions)).
- **Development** runs two native processes, `bin/rails server` and `npm run dev`. The browser
  only talks to Vite, which proxies `/api` to Rails — same origin, no CORS needed.
- **Production** deploys them independently: the Rails Docker image (which excludes
  `app/javascript`) and the static `dist/` build. The frontend is built with
  `VITE_API_BASE_URL` pointing at the API, and the API allows that origin via `CORS_ORIGINS`.

## 3. Stack and versions

| Area               | Choice                                                                                     | Version (locked)            |
| ------------------ | ------------------------------------------------------------------------------------------ | --------------------------- |
| Ruby               | `.ruby-version`                                                                            | 3.3.10                      |
| Rails              | API-only                                                                                   | 8.1.4                       |
| Web server         | Puma                                                                                       | 8.0.2                       |
| Database           | PostgreSQL (`pg` gem 1.7)                                                                  | 16 (CI and Compose use 16)  |
| Authorization      | Pundit (`app/policies`)                                                                    | 2.5                         |
| JSON responses     | Jbuilder views (`app/views/api`)                                                           | 2.15                        |
| Backend tests      | Minitest + `minitest-mock`, FactoryBot (`factory_bot_rails`) + Faker                       | 6.0 / 6.5 / 3.8             |
| Ruby lint          | RuboCop with `rubocop-rails-omakase`, plus Brakeman                                        | 1.92                        |
| Node.js            | LTS, `.nvmrc`                                                                              | 22 (≥ 22.13; 24 also works) |
| Package manager    | npm only — pinned by `"packageManager"` in `package.json`, so Corepack refuses `yarn` here | 10.9                        |
| UI                 | React, JavaScript + JSX (no TypeScript)                                                    | 19.3                        |
| Server state       | TanStack React Query                                                                       | 5.104                       |
| Routing            | React Router                                                                               | 7.18                        |
| Translations       | i18next + react-i18next                                                                    | 26.4 / 17.0                 |
| Build / dev server | Vite                                                                                       | 8.3                         |
| Frontend tests     | Vitest + React Testing Library + jsdom                                                     | 5.0 / 16.3                  |
| Lint / format      | ESLint 9 (flat config) + eslint-plugin-react / react-hooks, Prettier                       | 9.39, 3.9                   |
| Git hooks          | Lefthook (npm devDependency)                                                               | 2.2                         |
| CSS                | One plain stylesheet with CSS variables (`app/javascript/src/index.css`)                   | —                           |

ESLint stays on 9.x because `eslint-plugin-react` (needed for the i18n lint rule below)
does not support ESLint 10 yet.

## 4. Prerequisites

- **Ruby 3.3.10** via a version manager (rbenv, asdf, mise, rvm) — picked up from `.ruby-version`.
- **Node.js 22 LTS** — `nvm install` reads `.nvmrc`.
- **PostgreSQL 16** server and client libraries (section 7). PostgreSQL 14+ works locally.
- **Git**, **make** (optional shortcuts).
- **Docker** — _optional_. Only for the Compose database or building the production image.

macOS and Linux are supported directly. On Windows use WSL2.

## 5. Repository structure

```
.
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb    Pundit + error handling; verify_authorized on every action
│   │   ├── concerns/api_rescuable.rb    Exceptions → JSON errors (404/400/403/422)
│   │   ├── concerns/api_responders.rb   render_error → api/shared/error view
│   │   └── api/
│   │       ├── health_controller.rb     /api/health/live and /api/health/ready
│   │       └── sample_items_controller.rb
│   ├── models/sample_item.rb            Validations and normalization only
│   ├── policies/                        Pundit: application_policy.rb (deny by default), sample_item_policy.rb
│   ├── services/                        Business logic: sample_items/{list,create,update,destroy}_service.rb,
│   │                                    health/database_check_service.rb
│   ├── views/api/                       Jbuilder: sample_items/{index,show,_sample_item}, health/*, shared/error
│   └── javascript/                      React app (Vite root; ignored by Rails autoloading)
│       ├── index.html
│       ├── public/                      Static files copied as-is (favicon)
│       └── src/                         See "Frontend conventions"
├── bin/setup                            Install gems + npm packages, prepare DBs, run starter:check
├── bin/docker-entrypoint                Execs the command; deliberately does NOT migrate
├── config/locales/en.yml                API error messages (no hard-coded strings in Ruby)
├── config/database.yml                  DB_* in dev/test, DATABASE_URL in production
├── config/initializers/cors.rb          CORS from CORS_ORIGINS (off when empty)
├── config/environments/production.rb    STDOUT logs, SSL and host settings from env
├── db/migrate/ db/schema.rb db/seeds.rb
├── lib/tasks/starter.rake               bin/rails starter:check
├── test/
│   ├── factories/                       FactoryBot factories
│   ├── models/ policies/ services/      Unit tests
│   ├── integration/                     HTTP-level API tests
├── .github/workflows/ci.yml             Required quality gate
├── .github/workflows/deploy.yml         Manual-only image build + deploy hook
├── Dockerfile  .dockerignore            Production API image
├── compose.yaml                         OPTIONAL PostgreSQL container
├── package.json  vite.config.js  eslint.config.js  jsconfig.json  .prettierrc.json  .nvmrc
├── Gemfile  .rubocop.yml  .ruby-version
├── .env.example                         All local variables (Rails and Vite), placeholders only
├── lefthook.yml  Makefile
└── .editorconfig .gitattributes .gitignore
```

## 5a. Backend conventions

Every API action follows the same path:

```
request → controller ─ authorize (Pundit policy) ─► service (business logic) ─► Jbuilder view → JSON
                       └─ errors raised anywhere ─► ApiRescuable ─► api/shared/error view
```

1. **Controllers stay thin.** They load the record, call `authorize`/`policy_scope`, call one
   service, and render. No business rules, queries or `render json:` in controllers.
2. **All business logic lives in services** (`app/services/<resource>/<action>_service.rb`,
   QuizIt style: `initialize(...)` + `process!`). Services use bang methods (`create!`,
   `update!`, `destroy!`) and let exceptions propagate; `ApiRescuable` turns
   `ActiveRecord::RecordInvalid` into a 422 with field `details`.
3. **Authorization uses Pundit policies** (`app/policies/<model>_policy.rb`).
   `ApplicationPolicy` denies everything by default, so each policy must opt in.
   `ApplicationController` runs `verify_authorized` (and `verify_policy_scoped` for `index`), so
   an action that forgets to authorize raises `Pundit::AuthorizationNotPerformedError` in
   tests. Denials return **403** `{"error": "You are not allowed to perform this action"}`.
   Public endpoints (health checks) opt out explicitly with `skip_after_action`.
4. **Every response body comes from a Jbuilder view** in `app/views/api/<resource>/`. Records
   are rendered by one partial (`_sample_item.json.jbuilder`) so the shape is defined once.
   Payloads are wrapped in a root key (`sample_items: [...]`, `sample_item: {...}`), which leaves
   room for `meta` (e.g. pagination) later. Errors use `api/shared/error`. `DELETE` returns 204
   with no body.
5. **Messages come from `config/locales/en.yml`** via `I18n.t`, never hard-coded.
6. **Tests per layer:** policy tests in `test/policies/`, service tests in `test/services/`,
   HTTP behaviour (status codes, JSON shape, 403) in `test/integration/`, all using factories.

### API responses

| Request                                                                | Success                                                              | Errors        |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------- |
| `GET /api/sample_items`                                                | `200 {"sample_items":[{id,name,description,created_at,updated_at}]}` | —             |
| `GET /api/sample_items/:id`                                            | `200 {"sample_item":{...}}`                                          | 404           |
| `POST /api/sample_items` body `{"sample_item":{"name","description"}}` | `201 {"sample_item":{...}}`                                          | 400, 422      |
| `PATCH`/`PUT /api/sample_items/:id`                                    | `200 {"sample_item":{...}}`                                          | 400, 404, 422 |
| `DELETE /api/sample_items/:id`                                         | `204` (no body)                                                      | 404           |
| any, denied by policy                                                  | —                                                                    | 403           |

Error body: `{"error": "<message>"}`, plus `"details": {"field": ["message"]}` for 422.
The frontend unwraps the root keys in `src/apis/sampleItems.js`.

## 5b. Frontend conventions

Everything lives in `app/javascript/src/`. These rules keep the code uncluttered and are
enforced by review and, where possible, by lint.

```
src/
├── main.jsx                 Providers: React Query, BrowserRouter, i18n
├── App.jsx                  <Routes> built from routes.js
├── routes.js                ALL page paths (routes) and API endpoints (apiRoutes)
├── common/i18n.js           i18next setup
├── translations/en.json     ALL user-facing text
├── constants/               Shared constants: index.js, api.js, query.js
├── utils/                   Shared helpers: url.js (buildUrl), formatDate.js, errors.js, queryClient.js
├── apis/                    HTTP only: client.js (fetch wrapper, ApiError), sampleItems.js
├── hooks/reactQuery/        React Query hooks per resource: useSampleItems.js
├── components/
│   ├── commons/             Reusable pieces: Notice, LoadError
│   ├── NotFound.jsx
│   └── SampleItems/         One folder per feature
│       ├── index.jsx        List page        ├── Show.jsx   Detail page
│       ├── Form.jsx  List.jsx
│       ├── constants.js     Feature constants (limits, field ids, initial values)
│       └── utils.js         Feature helpers (validation, payload mapping)
└── test/                    setup.js, utils.jsx (renderApp with all providers)
```

1. **JavaScript + JSX only** — `.js` for logic, `.jsx` for components. No TypeScript.
2. **No hard-coded text.** Every visible string, label, `aria-label` and message comes from
   `translations/en.json` via `useTranslation()` / `t()` (interpolate with `{{name}}`).
   ESLint's `react/jsx-no-literals` fails on any text written directly in JSX.
3. **No inline constants.** Shared constants go in `src/constants/`; feature-specific ones in
   that feature's `constants.js`.
4. **No hard-coded paths.** Page paths are in `routes`, API endpoints in `apiRoutes`
   (`src/routes.js`). Fill parameters with `buildUrl(routes.sampleItems.show, { id })`.
5. **API calls only through React Query hooks** in `hooks/reactQuery/`. Components never call
   `apis/*` or `fetch` directly. Hooks use `QUERY_KEYS` and invalidate their lists after mutations.
6. **Utilities** go in `src/utils/` (shared) or the feature's `utils.js`, never inline in components.
7. **Imports** use bare aliases rooted at `src/`: `import { routes } from 'routes'`,
   `import sampleItemsApi from 'apis/sampleItems'`. Aliases are listed in `vite.config.js`
   (`SOURCE_ALIASES`) and mirrored in `jsconfig.json` for editors — add new top-level folders to both.

## 6. Quick start (native)

From a fresh clone, assuming Ruby, Node and a running PostgreSQL that your OS user can
connect to (section 7 explains how to set that up):

```bash
git clone <repo-url> my-assignment && cd my-assignment
cp .env.example .env   # optional; only needed if you must set DB_* or other variables
bin/setup              # gems, npm packages (+ Git hooks), dev and test databases, config check
```

`make setup` does the same. Then start the two servers (section 9) and open <http://localhost:5173>.

## 7. PostgreSQL installation and configuration

### Install and verify the server

|                | Ubuntu / Debian                                         | macOS (Homebrew)                    |
| -------------- | ------------------------------------------------------- | ----------------------------------- |
| Install        | `sudo apt install postgresql libpq-dev`                 | `brew install postgresql@16`        |
| Start          | `sudo systemctl start postgresql`                       | `brew services start postgresql@16` |
| Is it running? | `pg_isready` → `accepting connections`; `pg_lsclusters` | `pg_isready`; `brew services list`  |

`pg_lsclusters` also shows each cluster's **port**. If several versions are installed they
use different ports (e.g. 16 on 5432, 14 on 5433) — set `DB_PORT` accordingly.

### How Rails connects

`config/database.yml` reads optional variables in development and test:

| Variable      | When unset           |
| ------------- | -------------------- |
| `DB_HOST`     | Unix socket (no TCP) |
| `DB_PORT`     | 5432                 |
| `DB_USERNAME` | your OS username     |
| `DB_PASSWORD` | none                 |

Databases are named `starter_development` and `starter_test` (rename `app_name` at the
top of `database.yml` per assignment). Variables can be exported in the shell or put in
`.env` (git-ignored, loaded by `dotenv` in development and test only).

PostgreSQL authentication is set in `pg_hba.conf`. Typical defaults: **Unix socket → `peer`**
(the PostgreSQL role must equal your OS username, no password) and **TCP (`localhost`) →
`scram-sha-256`** (password required). Pick one of the two options below.

### Option A — socket + peer auth (no password, simplest on Linux)

Do not assume a role named after your OS user exists. Create it once:

```bash
sudo -u postgres createuser --createdb "$USER"
```

Leave all `DB_*` variables unset. (Homebrew on macOS already creates a superuser role named
after your OS user, so there is nothing to do.)

### Option B — TCP + password

```bash
sudo -u postgres psql -c "CREATE ROLE starter WITH LOGIN CREATEDB PASSWORD 'choose-a-local-password';"
```

Then in `.env`:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=starter
DB_PASSWORD=choose-a-local-password
```

### Create, migrate, inspect

```bash
bin/rails db:prepare            # create (if missing) + migrate dev and test databases
bin/rails starter:check         # Ruby version, connectivity, pending migrations (read-only)
bin/rails db:migrate:status
bin/rails dbconsole             # psql session using the same settings
```

## 8. Optional Docker Compose database

Use this only if you do not want a native PostgreSQL. Rails and Vite still run natively.

```bash
docker compose up -d db         # or: make db-up   (docker-compose v1 also works)
docker compose ps               # wait for "healthy"
```

- Image `postgres:16-alpine`, data in the named volume `db-data`.
- Published on **127.0.0.1:5434** so it never clashes with a native server on 5432.
- Credentials default to `starter` / `starter_local_only` (local only); override with
  `COMPOSE_DB_USER`, `COMPOSE_DB_PASSWORD`, `COMPOSE_DB_PORT` (shell or `.env`).

Point Rails at it in `.env`:

```bash
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=starter
DB_PASSWORD=starter_local_only
```

then `bin/rails db:prepare`. To switch back to native PostgreSQL, remove or comment out
those lines. Stop with `docker compose down` (keeps data); `docker compose down -v`
**deletes the data**.

## 9. Running Rails and React

Both commands run from the repository root.

Terminal 1 — API on <http://localhost:3000>:

```bash
bin/rails server          # or: make backend
```

Terminal 2 — UI on <http://localhost:5173>:

```bash
npm run dev               # or: make frontend
```

The Vite dev server proxies every `/api/*` request to `http://localhost:3000`
(`server.proxy` in `vite.config.js`). To proxy elsewhere (e.g. Rails on another port) set
`DEV_API_PROXY_TARGET` in `.env`. That variable is read only by the Vite config and never
reaches the browser.

Pages: `/sample-items` (list, create, edit, delete), `/sample-items/:id` (detail); `/`
redirects to the list and unknown paths show a not-found page.

## 10. Environment variables

Only `.env.example` is committed. Real `.env` / `.env.*` / `*.local` files are git-ignored.
Locally, one root `.env` serves both Rails (via dotenv) and Vite.

### Rails

| Variable                                           | Env        | Purpose                                                                                                |
| -------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` | dev, test  | Local PostgreSQL connection (all optional)                                                             |
| `PORT`                                             | all        | Puma port (default 3000)                                                                               |
| `RAILS_MAX_THREADS`                                | all        | Puma threads and DB pool size (default 3 / 5)                                                          |
| `DATABASE_URL`                                     | production | **Required.** `postgres://user:pass@host:5432/db`                                                      |
| `SECRET_KEY_BASE`                                  | production | **Required.** Generate with `bin/rails secret`                                                         |
| `CORS_ORIGINS`                                     | production | Comma-separated exact frontend origins, e.g. `https://app.example.com`. Empty = no cross-origin access |
| `APP_HOSTS`                                        | production | Comma-separated API host names for Host-header protection, e.g. `api.example.com`. Empty = disabled    |
| `RAILS_LOG_LEVEL`                                  | production | Default `info`                                                                                         |
| `RAILS_FORCE_SSL`                                  | production | Default `true`. Set `false` only to run the image locally over plain HTTP                              |

### Frontend

| Variable               | Purpose                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`    | API origin without `/api`, e.g. `https://api.example.com`. Empty in development. **Read at build time** — rebuild after changing it |
| `DEV_API_PROXY_TARGET` | Dev proxy target (default `http://localhost:3000`). Not exposed to the browser                                                      |

**Every `VITE_*` variable is compiled into the public JavaScript bundle.** Never put
passwords, tokens, database URLs, `SECRET_KEY_BASE` or any other secret in one.

## 11. Database commands

| Task                                           | Command                                                                 |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| Create databases                               | `bin/rails db:create`                                                   |
| Create if missing + migrate (safe, idempotent) | `bin/rails db:prepare`                                                  |
| Run migrations                                 | `bin/rails db:migrate`                                                  |
| Migration status                               | `bin/rails db:migrate:status`                                           |
| New migration                                  | `bin/rails generate migration AddPriceToSampleItems price:decimal`      |
| New model + migration                          | `bin/rails generate model Invoice number:string:uniq total:decimal`     |
| Roll back last migration (dev)                 | `bin/rails db:rollback`                                                 |
| Prepare test DB                                | `RAILS_ENV=test bin/rails db:prepare` (tests also auto-load the schema) |
| Load demo data                                 | `bin/rails db:seed` (skipped in production)                             |
| ⚠️ **DESTRUCTIVE** reset dev DB                | `bin/rails db:reset` (drops, recreates, loads schema, seeds)            |
| ⚠️ **DESTRUCTIVE** rebuild from migrations     | `bin/rails db:migrate:reset`                                            |

`bin/setup`, `bin/rails server` and the Docker entrypoint never drop or reset data.

### Migration safety

During a deploy, old and new code briefly run against the same schema. Keep every
migration compatible with the **currently running** code:

- Add columns as nullable (or with a default); backfill separately; add `NOT NULL` later.
- Do not rename or drop a column in one step. Stop using it in code first
  (`self.ignored_columns += ["old"]`), deploy, then drop it in a later migration.
- On large tables add indexes with `algorithm: :concurrently` + `disable_ddl_transaction!`.
- Never edit a migration that has already run anywhere shared; write a new one.
- Commit `db/schema.rb` together with the migration.

## 12–14. Tests and linting

| What                   | Command                                                       | Notes                                 |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------- |
| All backend tests      | `bin/rails test`                                              | Needs PostgreSQL; uses `starter_test` |
| One file / one line    | `bin/rails test test/integration/sample_items_api_test.rb:15` |                                       |
| Ruby lint              | `bin/rubocop` (`-a` to autocorrect)                           | Omakase style                         |
| Security scan          | `bin/brakeman`                                                |                                       |
| Frontend tests         | `npm test` (`npm run test:watch`)                             | Vitest + jsdom                        |
| One test file          | `npx vitest run app/javascript/src/apis/client.test.js`       |                                       |
| ESLint                 | `npm run lint`                                                | Fails on any warning                  |
| Prettier               | `npm run format:check` / `npm run format`                     |                                       |
| Production build       | `npm run build`                                               | → `dist/`                             |
| **Everything CI runs** | `make check`                                                  |                                       |

**Backend tests (36)** build records with FactoryBot (`test/factories/`, values from Faker):
`create(:sample_item)`, `build(:sample_item, :without_description)`. They cover:
policies (sample allows all actions, scope, base policy denies all); services (list order and
scope, create/update raising `RecordInvalid`, destroy, database check true/false); the model
(validations, normalization); and the HTTP API (liveness; readiness OK and 503 with a stubbed
DB failure, no leaked host/user; list/show/create/PATCH/PUT/delete with the JSON envelope;
422 details; 400 for a missing root key and malformed JSON; unpermitted attributes; 404s;
403 when a policy denies).

**Frontend tests (25)** render the real `App` (routes, i18n, React Query) through
`renderApp(path)` in `src/test/utils.jsx`, mock `apis/sampleItems`, and look up text via
`t()` so they do not duplicate translations. They cover the API client (success, 204, 422
details, non-JSON errors, network failure), the sample items API module (unwrapping the
JSON envelope, URLs, request body), `buildUrl`, feature validation, the list page
(redirect from `/`, empty, error + retry, client validation, create, server validation,
edit, delete), the detail page (load by URL id, 404) and the not-found route.

Lint exceptions: `react/prop-types` is off (React 19 ignores propTypes);
`react/jsx-no-literals` is off in test files; `eslint-config-prettier` disables rules Prettier owns.

## 15. Git hooks

[Lefthook](https://lefthook.dev) runs the hooks in `lefthook.yml`. It is an npm
devDependency, so **`npm install` / `npm ci` installs the hooks automatically** (skipped
when `CI=true`). To (re)install manually: `make hooks` or `npx lefthook install`.

| Hook         | Runs                                                                                                                   | Typical time |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------ |
| `pre-commit` | RuboCop on staged Ruby files; ESLint and Prettier `--check` on staged JS/JSX files. Nothing is auto-fixed or re-staged | 1–3 s        |
| `pre-push`   | RuboCop + Minitest, and ESLint, Prettier, Vitest, build, in parallel                                                   | ~6–10 s      |

Bypass deliberately: `git commit --no-verify`, `git push --no-verify`, or `LEFTHOOK=0 git …`.
Personal tweaks go in `lefthook-local.yml` (git-ignored). Hooks are a convenience, **not a
security boundary** — CI runs the same checks and is the gate that matters.

## 16. GitHub Actions CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`, with
`contents: read` permissions only. Two parallel jobs:

- **Backend (Rails)** — Ruby from `.ruby-version` with cached gems; a `postgres:16` service
  with throwaway credentials; RuboCop, Brakeman, `db:prepare`, Minitest (eager loading on, as `CI=true`).
- **Frontend (React)** — Node from `.nvmrc` with npm cache; `npm ci`; ESLint, Prettier,
  Vitest, production build.

Any failing step fails the workflow. In-progress runs for the same PR are cancelled when
you push again. To make it a hard gate, enable branch protection on `main` and require
both checks.

## 17. Deployment

Production runs on **Render**, free plan, region Singapore, defined in [`render.yaml`](render.yaml)
(a Render Blueprint):

| Piece      | Render service                                     | URL                                            |
| ---------- | -------------------------------------------------- | ---------------------------------------------- |
| Rails API  | Web Service from the GHCR image (`runtime: image`) | `https://rails-react-starter-api.onrender.com` |
| React app  | Static Site built from `main` (`dist/`)            | `https://rails-react-starter-web.onrender.com` |
| PostgreSQL | Render PostgreSQL 16 (`rails-react-starter-db`)    | internal `DATABASE_URL`                        |

**Nothing deploys automatically.** The API is image-backed (Render never redeploys it on its
own) and the static site has auto-deploy and PR previews off. The only way to deploy is
**Actions → Deploy → Run workflow → branch `main`** (`.github/workflows/deploy.yml`), which:

1. refuses to continue unless CI passed for that exact commit on `main`;
2. builds the API image (with the commit baked in as `APP_REVISION`) and pushes
   `ghcr.io/<owner>/<repo>-api:{sha-<commit>,latest}`;
3. calls the API's deploy hook with that exact image and waits until `/api/health/live`
   reports the commit, then checks `/api/health/ready` is 200 (database reachable);
4. only then calls the static site's deploy hook and waits until `/version.txt` reports the
   commit, then checks the page loads.

It runs one at a time in the GitHub `production` environment (add required reviewers there for
an extra approval click).

**Configuration lives in three places, and none of it is a secret in the repo:**

| Where                                           | What                                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `render.yaml` (committed)                       | `CORS_ORIGINS`, `APP_HOSTS`, `VITE_API_BASE_URL`, plan, region, health check, rewrite                                |
| Render (generated)                              | `DATABASE_URL` (from the database), `SECRET_KEY_BASE` (`generateValue`)                                              |
| GitHub → Settings → Environments → `production` | Secrets `RENDER_BACKEND_DEPLOY_HOOK_URL`, `RENDER_FRONTEND_DEPLOY_HOOK_URL`; variables `BACKEND_URL`, `FRONTEND_URL` |

**Migrations** run when the API starts (`bin/migrate-and-start`, the `dockerCommand` in
`render.yaml`) because Render's free plan has no pre-deploy command. This is safe only with a
single instance. On a paid plan, set `preDeployCommand: bin/rails db:migrate` and remove
`dockerCommand`. Seeds never run in production.

**CORS:** the API allows exactly one origin, the static site (`CORS_ORIGINS`). Both are
`*.onrender.com` subdomains, so they are different origins and CORS is required.

### First deploy (one time)

1. **Merge to `main`** and wait for CI to pass.
2. **Publish the first image:** run **Actions → Deploy**. With no deploy hooks set yet it only
   builds and pushes the image (Render needs it to exist before creating the service).
3. **Image visibility:** for a **public** repository the image is already public, so there is
   nothing to do. For a private repository, either make the package public (GitHub → your profile →
   **Packages** → `<repo>-api` → **Package settings** → **Change visibility → Public**) or add
   GHCR registry credentials in Render.
4. **Create everything on Render:** Render dashboard → **New → Blueprint** → connect GitHub and
   pick this repository → **Apply**. It creates the database, the API (deploys `:latest`) and the
   static site (first build).
5. **Check the URLs** in the Render dashboard. If a name was taken, Render adds a suffix: then
   update `CORS_ORIGINS`, `APP_HOSTS` and `VITE_API_BASE_URL` in `render.yaml` and merge.
6. **Connect GitHub to Render:** for each of the two services, Render → service →
   **Settings → Deploy Hook** → copy. Add them as secrets in GitHub → **Settings → Environments
   → `production`** (or in a terminal: `gh secret set RENDER_BACKEND_DEPLOY_HOOK_URL --env production`,
   which prompts for the value without echoing it). A deploy hook URL lets anyone trigger a
   deploy: never commit it or paste it anywhere else.
7. **Add the variables** in the same environment: `BACKEND_URL` and `FRONTEND_URL` (the two
   `https://….onrender.com` URLs).
8. **Run Actions → Deploy** again. It deploys both and verifies them; then do the smoke test
   below.

### Every later deploy

Merge to `main`, wait for CI, then **Actions → Deploy → Run workflow → `main`**.

### Render free-plan limits

- The API sleeps after ~15 minutes without traffic; the next request takes ~30–60 s (the
  static site never sleeps). The deploy workflow waits up to 15 minutes per service.
- Free PostgreSQL databases expire after about 30 days (Render emails before deleting).
- The static site builds the latest commit on `main` when its hook is called. If `main` moved
  after you started the workflow, the frontend check fails with a commit mismatch: run Deploy
  again for the new commit.

### Using another host

Nothing in the app is Render-specific: the API is a plain Docker image honoring `PORT`,
`DATABASE_URL`, `SECRET_KEY_BASE`, `CORS_ORIGINS` and `APP_HOSTS`, and the frontend is static
`dist/` built with `VITE_API_BASE_URL` plus an SPA fallback to `index.html`. Only `render.yaml`
and the deploy steps of `deploy.yml` would change.

### Run the production image locally

Verified on Linux with the Compose database (on macOS replace `--network host` with
`-p 3100:3100` and `localhost` in the URL with `host.docker.internal`):

```bash
docker compose up -d db
docker build -t starter-api .
export DATABASE_URL=postgres://starter:starter_local_only@localhost:5434/starter_production
export SECRET_KEY_BASE=$(openssl rand -hex 64)
docker run --rm --network host -e DATABASE_URL -e SECRET_KEY_BASE starter-api ./bin/rails db:prepare
docker run --rm --network host -e DATABASE_URL -e SECRET_KEY_BASE -e PORT=3100 -e RAILS_FORCE_SSL=false starter-api
curl localhost:3100/api/health/ready
```

### Smoke-test checklist (live)

- [ ] `curl https://<api>/api/health/live` → `200 {"status":"ok"}`
- [ ] `curl https://<api>/api/health/ready` → `200`, `"database":"ok"`
- [ ] `curl https://<api>/api/sample_items` → `200 []` (or items)
- [ ] Open the frontend: list loads with no console errors (no CORS error)
- [ ] Create an item → success message, item appears; reload → still there (persisted)
- [ ] Open the item's detail page, then reload it directly (checks the SPA fallback)
- [ ] Edit it, then delete it; submit an empty name → inline validation message
- [ ] Platform logs show the requests with request IDs and no secrets

### Logs

Production logs go to STDOUT (tagged with request IDs), so they appear in the platform's
log viewer / `docker logs <container>`. Liveness probes are silenced. Raise detail
temporarily with `RAILS_LOG_LEVEL=debug` (this can log personal data — revert afterwards).
Parameters matching `passw`, `secret`, `token`, `_key`, `email`, etc. are filtered
(`config/initializers/filter_parameter_logging.rb`).

### Failed deployments

| Symptom                                               | Likely cause / fix                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Container exits at boot, `Missing secret_key_base`    | Set `SECRET_KEY_BASE`                                                                         |
| `/ready` returns 503                                  | Wrong `DATABASE_URL`, DB not reachable from the service, or TLS required (`?sslmode=require`) |
| `ActiveRecord::PendingMigrationError` / missing table | Release command did not run; run `bin/rails db:migrate` once                                  |
| `403 Blocked hosts`                                   | Add the API domain to `APP_HOSTS` (health checks are exempt)                                  |
| Browser: "blocked by CORS policy"                     | `CORS_ORIGINS` must exactly equal the frontend origin (scheme + host, no slash)               |
| Frontend calls the wrong URL                          | `VITE_API_BASE_URL` is baked at build time — fix it and rebuild                               |
| Detail page 404s on reload                            | Static host SPA fallback to `index.html` is missing                                           |
| Health check fails though logs look fine              | Platform port ≠ Puma port; make sure `PORT` is set/forwarded                                  |

## 18. Health checks

| Endpoint                | Meaning                                           | Touches DB | Success                                          | Failure                                                            |
| ----------------------- | ------------------------------------------------- | ---------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| `GET /api/health/live`  | The Rails process can answer                      | No         | `200 {"status":"ok","revision":"<commit>"}`      | No answer / timeout                                                |
| `GET /api/health/ready` | Ready for real traffic (DB reachable, `SELECT 1`) | Yes        | `200 {"status":"ok","checks":{"database":"ok"}}` | `503 {"status":"unavailable","checks":{"database":"unavailable"}}` |

**Liveness** tells the platform whether to _restart_ the container. **Readiness** tells it
whether to _send traffic_ (and whether a new deploy is healthy enough to replace the old
one). They are unauthenticated, reveal no configuration, and readiness logs only the error
class (connection messages can contain host and user names). They are exempt from
`APP_HOSTS` Host checks, since platforms probe by internal IP. The Docker image also defines
a `HEALTHCHECK` against `/api/health/live`. `revision` is the commit the image was built
from (`APP_REVISION`, set by `deploy.yml`); it is omitted when unknown, e.g. locally.

In **development only**, Rails checks for pending migrations on every request, so with the
database down even `/live` returns 500 locally. Production does not do this (verified).

## 19. Troubleshooting

| Error                                                                    | Fix                                                                                                                                       |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `role "<name>" does not exist`                                           | Create the role (section 7, option A or B)                                                                                                |
| `Peer authentication failed for user "starter"`                          | You set `DB_USERNAME` but not `DB_HOST`; peer auth needs the OS user. Set `DB_HOST=localhost` to use password auth                        |
| `fe_sendauth: no password supplied` / `password authentication failed`   | Set or correct `DB_PASSWORD`                                                                                                              |
| `Connection refused` / `No such file or directory … .s.PGSQL.5432`       | Server not running (`pg_isready`), or it listens on another port (`pg_lsclusters`) → set `DB_PORT`                                        |
| `permission denied to create database`                                   | `sudo -u postgres psql -c 'ALTER ROLE "<name>" CREATEDB;'`                                                                                |
| `database "starter_development" does not exist`                          | `bin/rails db:prepare`                                                                                                                    |
| `ActiveRecord::PendingMigrationError`                                    | `bin/rails db:migrate`                                                                                                                    |
| `pg` gem fails to install                                                | Install client headers: `sudo apt install libpq-dev` / `brew install libpq`                                                               |
| `rbenv: version '3.3.10' is not installed`                               | `rbenv install 3.3.10` (or your manager's equivalent)                                                                                     |
| Port 3000 / 5173 in use                                                  | `bin/rails server -p 3001` with `DEV_API_PROXY_TARGET=http://localhost:3001`; Vite picks the next free port                               |
| UI says "Could not reach the server" / proxy errors in the Vite terminal | Rails is not running on the proxy target                                                                                                  |
| `Failed to resolve import "xyz/..."`                                     | New top-level `src/` folder not added to `SOURCE_ALIASES` in `vite.config.js`                                                             |
| Lint: `Strings not allowed in JSX files`                                 | Move the text to `translations/en.json` and render `t('key')`                                                                             |
| `uninitialized constant Pundit` (or any new gem) in the running server   | Restart `bin/rails server` after `bundle install`                                                                                         |
| `Pundit::AuthorizationNotPerformedError`                                 | The action never called `authorize` / `policy_scope`                                                                                      |
| `This project is configured to use npm` when running `yarn`              | Intended: use `npm install` / `npm run dev`. If Yarn already ran, delete `yarn.lock`, `.yarn/`, `.pnp.*`, `node_modules` and run `npm ci` |
| Unexpected rows in backend tests                                         | Stale data in the test DB: `RAILS_ENV=test bin/rails db:schema:load`                                                                      |
| `make check-config`                                                      | Runs `bin/rails starter:check`, which pinpoints most DB issues                                                                            |
| Hooks do not run                                                         | `make hooks`; check `git config core.hooksPath` is unset                                                                                  |

## 20. Replacing the sample feature

1. Rename `app_name` in `config/database.yml`, `name` in `package.json`, `app.title` in
   `translations/en.json`, and this README's title.
2. Backend, following [the conventions](#5a-backend-conventions):
   - `bin/rails g model Employee name:string salary:decimal`, validations, `bin/rails db:migrate`;
   - `app/policies/employee_policy.rb` (opt in to each allowed action) and its `Scope`;
   - services in `app/services/employees/` holding the business logic;
   - a thin controller in `app/controllers/api/` (copy `SampleItemsController`) and `resources` in `config/routes.rb`;
   - views in `app/views/api/employees/` (`_employee`, `index`, `show`);
   - new messages in `config/locales/en.yml`;
   - a factory plus model, policy, service and integration tests.
3. Frontend, following [the conventions](#5b-frontend-conventions):
   - paths in `routes.js` (`routes` and `apiRoutes`), text in `translations/en.json`;
   - `apis/employees.js`, `hooks/reactQuery/useEmployees.js`, a `QUERY_KEYS` entry;
   - `components/Employees/` with `index.jsx`, `constants.js`, `utils.js`, and `<Route>`s in `App.jsx`.
4. Delete the sample: model, controller, policy, services, views, route, factory and tests; a migration dropping
   `sample_items`; `apis/sampleItems.js`, `hooks/reactQuery/useSampleItems.js`,
   `components/SampleItems/`, its routes, translations, `QUERY_KEYS` entry and seeds.
5. Keep the health endpoints, `ApplicationPolicy`, error concerns and view, API client, commons and tooling.

### Adding authentication later

Add authentication and authorization as soon as data belongs to a user or must not be
public. Choices with this setup:

- **Cookie session** (simplest, safest in browsers): host frontend and API under the same
  site or proxy `/api` through the frontend host; add cookie/session middleware,
  `SameSite=Lax`/`Strict`, `Secure`, `HttpOnly` cookies and CSRF protection. Cross-origin
  cookies also need `credentials: true` in `rack-cors` (never with wildcard origins) and
  `credentials: 'include'` in `apiRequest`.
- **Bearer token**: send `Authorization` headers from `apiRequest`; no CSRF issue, but never
  store long-lived tokens in `localStorage` for sensitive apps.
- Rails 8 ships `bin/rails generate authentication` (session based) as a starting point.

Then replace the `current_user` placeholder in `ApplicationController` (Pundit passes it to
every policy) and write the real rules in each policy, e.g. `record.user_id == user.id` and
`scope.where(user:)` in `Scope#resolve`. Add policy tests for both the allowed and the denied user.

## 21. Security limitations

- No authentication, rate limiting or audit trail. Pundit is wired in, but `SampleItemPolicy`
  allows everything (there is no user yet): anyone who can reach the API can read, create,
  change and delete every sample item.
- CORS is a browser protection only; it does not protect the API from other clients.
- Input is validated (presence, length) and strong-parameterized, and errors never expose
  stack traces or SQL in production, but there is no abuse protection (e.g. `rack-attack`).
- Secrets: no Rails credentials file is used; production secrets are environment variables
  only. CI uses a throwaway Postgres container, never production credentials.
- Dependency updates are manual (consider enabling Dependabot on GitHub).

## 22. Known limitations and manual steps

- **The Render setup was verified end to end** (Blueprint creation, migrations, CORS, SPA
  rewrite, and a manual `deploy.yml` run updating both services) in the project this starter
  came from. Render names are global: if `rails-react-starter-*` is taken, rename the services.
- `deploy.yml` only runs when started manually from the Actions tab. Without the Render deploy
  hook secrets it only publishes the image.
- Database roles and the PostgreSQL service must be set up by hand (section 7).
- The frontend is tested in jsdom; there are no browser end-to-end tests.
- Only English translations are included; add `translations/<locale>.json` and register it in
  `common/i18n.js` for more.
- No pagination on the sample list endpoint.
