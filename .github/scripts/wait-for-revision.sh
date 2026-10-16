#!/usr/bin/env bash
# Polls a URL until the commit it reports equals the expected SHA, then exits 0.
# Exits 1 on timeout. Used by deploy.yml to confirm a deploy actually went live.
#
# Usage: wait-for-revision.sh <url> <expected-sha> [jq-filter]
#   With a jq filter the response is JSON and the filter extracts the revision;
#   without one the whole (trimmed) response body is the revision.
# Env: TIMEOUT_SECONDS (default 900; free Render services can take minutes to start).
set -euo pipefail

url=$1
expected=$2
filter=${3:-}
deadline=$(( $(date +%s) + ${TIMEOUT_SECONDS:-900} ))
current=""

while [ "$(date +%s)" -lt "$deadline" ]; do
  if body=$(curl --fail --silent --show-error --max-time 60 "$url" 2>/dev/null); then
    if [ -n "$filter" ]; then
      current=$(jq -r "$filter" <<<"$body" 2>/dev/null || true)
    else
      current=$(tr -d '[:space:]' <<<"$body")
    fi
    if [ "$current" = "$expected" ]; then
      echo "$url is serving $expected."
      exit 0
    fi
  fi
  echo "Waiting for $url (serving: ${current:-unreachable}, want: $expected)..."
  sleep 15
done

echo "::error::Timed out waiting for $url to serve $expected (last seen: ${current:-unreachable})."
exit 1
