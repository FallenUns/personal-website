#!/usr/bin/env bash
# Points the live site at another build and restarts the backend.
# Run on the server:
#   scripts/rollback.sh "$DEPLOY_PATH/archive/pre-rebuild"
#   scripts/rollback.sh "$DEPLOY_PATH/releases/<commit>"
set -euo pipefail

target="${1:?usage: rollback.sh <path to a build folder>}"
deploy_path="${DEPLOY_PATH:?set DEPLOY_PATH to the deploy root, for example /var/www}"

[ -f "$target/index.html" ] || { echo "No index.html in $target" >&2; exit 1; }

ln -sfn "$target" "$deploy_path/current"
ln -sfn "$deploy_path/current" "$deploy_path/html"
sudo systemctl restart portfolio-server

for attempt in $(seq 1 10); do
  if curl -fsS http://127.0.0.1:3001/api/health >/dev/null; then
    echo "Now serving $target"
    exit 0
  fi
  sleep 1
done
echo "Site switched to $target, but the backend did not answer /api/health" >&2
exit 1
