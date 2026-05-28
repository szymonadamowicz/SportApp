# SportApp

A simple fitness app for planning workouts, tracking progress, and viewing stats.

## What is inside

1. `frontend-app` - Next.js + TypeScript
2. `backend-app` - ASP.NET Core + EF Core
3. `docker-compose.yaml` - `real` and `mock` profiles

## Quick Start (Local)

### 1) Database (optional, only if you want real backend mode)

```bash
# Windows (PowerShell)
./scripts/run-database-local.ps1

# Linux/macOS
./scripts/run-database-local.sh
```

### 2) Backend

```bash
cd backend-app/apiModule/ApiModule/WebApplication1
dotnet run
```

Backend will be available at `http://localhost:5064` (Swagger: `/swagger`).

### 3) Frontend

```bash
cd frontend-app
npm install
npm run dev
```

Frontend: `http://localhost:3000`

## Frontend Environment (Local Dev)

For `npm run dev`, use:

`frontend-app/.env.local`

Examples:

```env
# real mode
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_URL=http://localhost:5064/api
```

```env
# mock mode
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_API_URL=http://localhost:5064/api
```

In `mock` mode, frontend uses local mocks and does not require backend.

## Mobile App (Capacitor)

The project supports three frontends:

1. Web PC: regular Next.js app on desktop.
2. Web mobile: regular Next.js app opened in a mobile browser.
3. Android app: Capacitor shell loading the same web app.

See `MOBILE_APP.md` for emulator and physical phone commands.

## Docker (Profiles)

### Recommended runner scripts

Use the helper scripts to avoid stale profile/mode issues:

```bash
# Windows (PowerShell)
./scripts/run-app-docker.ps1 -Profile real
./scripts/run-app-docker.ps1 -Profile mock

# Linux/macOS
./scripts/run-app-docker.sh --profile real
./scripts/run-app-docker.sh --profile mock
```

Optional flags:

1. `-Detached` / `--detached` to run in background
2. `-NoCache` / `--no-cache` if frontend mode still looks stale

### `real` profile

Starts: `postgres` + `backend` + `frontend-real`

```bash
docker compose --profile real up --build
```

### `mock` profile

Starts: `frontend-mock`

```bash
docker compose --profile mock up --build
```

### Stop

```bash
docker compose down
```

## Important: profiles and image cache

Frontend `NEXT_PUBLIC_API_MODE` is baked during `docker build`.

That means:

1. Switching profile without rebuilding can keep old mode.
2. When switching `real <-> mock`, run with `--build`.

If mode is still wrong:

```bash
./scripts/run-app-docker.ps1 -Profile mock -NoCache
```

Or on Linux/macOS:

```bash
./scripts/run-app-docker.sh --profile mock --no-cache
```

## Tests and quality checks

```bash
cd frontend-app
npm run lint
npm test -- --runInBand
npm run build
```

For a broader local release check on Windows:

```powershell
./scripts/verify-release.ps1
```

Optional Docker image verification:

```powershell
./scripts/verify-release.ps1 -WithDocker
```

## API smoke check

When the real backend is running, this script verifies the critical API path:
health, register, create workout, start run, save progress, complete run, and
read progress.

```powershell
docker compose --profile real up -d postgres backend
./scripts/smoke-api.ps1
```

## Operational settings

Backend defaults are development-friendly. For stricter environments, configure:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000;http://YOUR_PC_LAN_IP:3000
FORM_ANALYSIS_TIMEOUT_SECONDS=300
FORM_ANALYSIS_MAX_VIDEO_MEGABYTES=250
Jwt__Key=replace-with-a-long-secret-for-non-dev-use
```

`FormAnalysis__MaxVideoMegabytes` is capped at 250 MB by the API. Uploaded
analysis videos are validated by size, MIME type, and extension before they are
stored.

## Structure (short)

```text
SportApp/
  backend-app/
  frontend-app/
  scripts/
  docker-compose.yaml
```

## Common issues

1. Frontend still calls API in `mock` mode:
   - rebuild image (`--build`, and if needed `--no-cache`)
2. `npm run dev` behaves differently than Docker:
   - expected; local dev reads `.env.local`, Docker uses Compose `build.args`
3. No backend in `mock` profile:
   - expected; `mock` profile starts frontend only
