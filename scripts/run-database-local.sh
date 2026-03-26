#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

echo "[local-db] Building and starting postgres container..."
cd "$REPO_ROOT"
docker compose --profile real up -d --build postgres

echo "[local-db] Postgres is running independently."
echo "[local-db] Stop with: docker compose --profile real stop postgres"
