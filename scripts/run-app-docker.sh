#!/usr/bin/env sh
set -eu

PROFILE="mock"
DETACHED=0
NO_CACHE=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --profile)
      PROFILE="${2:-}"
      shift 2
      ;;
    --detached|-d)
      DETACHED=1
      shift
      ;;
    --no-cache)
      NO_CACHE=1
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: ./scripts/run-app-docker.sh [--profile real|mock] [--detached] [--no-cache]"
      exit 1
      ;;
  esac
done

if [ "$PROFILE" != "real" ] && [ "$PROFILE" != "mock" ]; then
  echo "Invalid profile '$PROFILE'. Use: real or mock"
  exit 1
fi

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

if [ "$PROFILE" = "real" ]; then
  FRONTEND_SERVICE="frontend-real"
else
  FRONTEND_SERVICE="frontend-mock"
fi

echo "[docker-run] Stopping current stack to avoid stale profile state..."
cd "$REPO_ROOT"
docker compose down --remove-orphans

if [ "$NO_CACHE" -eq 1 ]; then
  echo "[docker-run] Rebuilding $FRONTEND_SERVICE without cache..."
  docker compose --profile "$PROFILE" build --no-cache "$FRONTEND_SERVICE"
fi

if [ "$DETACHED" -eq 1 ]; then
  echo "[docker-run] Starting profile '$PROFILE' in background..."
  docker compose --profile "$PROFILE" up --build -d
  echo "[docker-run] Logs: docker compose --profile $PROFILE logs -f"
else
  echo "[docker-run] Starting profile '$PROFILE'..."
  docker compose --profile "$PROFILE" up --build
fi
