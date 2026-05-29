# RepForge

[![CI](https://github.com/szymonadamowicz/SportApp/actions/workflows/ci.yml/badge.svg)](https://github.com/szymonadamowicz/SportApp/actions/workflows/ci.yml)

RepForge is a bachelor's project for planning workouts, running training
sessions, tracking progress, and reviewing basic exercise form analysis from
recorded videos.

The project supports three user-facing targets:

1. Web PC - desktop browser.
2. Web mobile - mobile browser on the same network.
3. App mobile - Android app shell built with Capacitor.

The frontend can run in two data modes:

1. `mock` - local in-browser data, no backend required.
2. `real` - ASP.NET Core API + PostgreSQL.

## Tech Stack

Frontend:

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- Framer Motion
- Capacitor Android

Backend:

- ASP.NET Core 8
- Entity Framework Core
- PostgreSQL
- JWT authentication
- Python/OpenCV/YOLO-based exercise form analysis

Infrastructure:

- Docker Compose profiles for mock and real runtime
- PowerShell helper scripts for local development, Docker, Android, release
  verification, and API smoke checks

## Repository Structure

```text
SportApp/
  backend-app/      ASP.NET Core API and Python form analysis module
  frontend-app/     Next.js web app and Capacitor Android project
  scripts/          Local, Docker, Android, smoke, and release helpers
  docker-compose.yaml
  .env.example
  MOBILE_APP.md
```

## Runtime Matrix

| Target | Local mock | Local real API | Docker mock | Docker real API |
| --- | --- | --- | --- | --- |
| Web PC | Yes | Yes | Yes | Yes |
| Web mobile | Yes | Yes, with PC LAN IP | Yes | Yes, with PC LAN API URL baked at build time |
| Android app | Yes, through local web server | Yes, through local web server + API | Not recommended for daily dev | Possible, but local web server is simpler |

For phone testing, `localhost` means the phone itself. Use the computer LAN IP,
for example `192.168.1.25`.

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop
- .NET SDK 8 if running the backend outside Docker
- Android Studio + Android SDK for the Android app
- Python dependencies are installed inside the backend Docker image

## Environment

Copy `.env.example` to `.env` only when you want to override Docker defaults:

```powershell
Copy-Item .env.example .env
```

For local Next.js development, prefer `frontend-app/.env.local` or the helper
scripts below.

Important variables:

```env
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_API_URL=http://localhost:5064/api
NEXT_PUBLIC_API_URL_REAL=http://localhost:5064/api
NEXT_PUBLIC_API_URL_MOCK=http://localhost:5064/api
CORS_ALLOWED_ORIGINS=http://localhost:3000
FORM_ANALYSIS_TIMEOUT_SECONDS=300
FORM_ANALYSIS_MAX_VIDEO_MEGABYTES=250
FORM_ANALYSIS_MAX_ANALYSES_PER_USER=50
FORM_ANALYSIS_RETENTION_DAYS=30
Jwt__Key=dev-only-change-me-to-at-least-32-characters
```

Security split:

- In `Development`, the API may run with the dev JWT secret and permissive CORS
  when no origins are configured.
- Outside `Development`, the API refuses to start unless
  `CORS_ALLOWED_ORIGINS`/`Cors:AllowedOrigins` is explicit and `Jwt__Key` is a
  unique non-dev secret with at least 64 characters.
- Generate a local strong secret when needed:

```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

For a physical phone, replace `localhost` with the computer LAN IP:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.25:5064/api
NEXT_PUBLIC_API_URL_REAL=http://192.168.1.25:5064/api
CORS_ALLOWED_ORIGINS=http://localhost:3000;http://192.168.1.25:3000
```

## Video Analysis Beta

Exercise form analysis is a controlled beta feature. It is intended for short,
single-set clips and currently supports only:

- Squat
- Bench press

The backend stores uploaded source videos and analyzed previews under
`App_Data/form-analysis` or the Docker `form_analysis_data` volume. To keep the
feature predictable, uploads are capped by `FORM_ANALYSIS_MAX_VIDEO_MEGABYTES`,
and old analysis records/files are cleaned up automatically by
`FORM_ANALYSIS_MAX_ANALYSES_PER_USER` and `FORM_ANALYSIS_RETENTION_DAYS`.

When the Python analyzer is missing, times out, or cannot process a clip, the
recording remains saved and the UI shows a retry-oriented beta failure state
instead of raw backend output.

### YOLO Model Files

YOLO `.pt` weights are not tracked in Git. This project intentionally uses a
download script instead of Git LFS so the working tree and future commits stay
small, and onboarding does not require extra Git tooling. Existing Git history
is not rewritten by this setup.

Default local model download:

```powershell
.\scripts\download-yolo-models.ps1
```

Optional larger pose model:

```powershell
.\scripts\download-yolo-models.ps1 -Models yolov8m-pose
```

The backend Docker image downloads `yolov8s-pose.pt` during build. The current
form analyzer uses pose models only; `yolov8m.pt` is left available in the
download script for experiments, but it is not needed for squat/bench analysis.

## Local Web PC

### Mock mode

```powershell
.\scripts\run-frontend-local.ps1 -Mode mock
```

Open:

```text
http://localhost:3000
```

### Real API mode

Option A: run Postgres and backend in Docker:

```powershell
docker compose --profile real up -d postgres backend
```

Run the frontend against the API:

```powershell
.\scripts\run-frontend-local.ps1 -Mode real -ApiUrl http://localhost:5064/api
```

Open:

```text
http://localhost:3000
```

API health:

```text
http://localhost:5064/health
```

Swagger in development:

```text
http://localhost:5064/swagger
```

Option B: run Postgres in Docker and backend locally:

```powershell
.\scripts\run-database-local.ps1
cd backend-app/apiModule/ApiModule/WebApplication1
dotnet run
```

Then run the frontend:

```powershell
.\scripts\run-frontend-local.ps1 -Mode real -ApiUrl http://localhost:5064/api
```

## Local Web Mobile

Find the computer LAN IP:

```powershell
ipconfig
```

Use the IPv4 address from the active network adapter, for example
`192.168.1.25`.

### Mock mode

```powershell
.\scripts\run-frontend-local.ps1 -Mode mock -Mobile
```

Open on the phone:

```text
http://192.168.1.25:3000
```

### Real API mode

Start the API:

```powershell
docker compose --profile real up -d postgres backend
```

Run the frontend with a phone-reachable API URL:

```powershell
.\scripts\run-frontend-local.ps1 -Mode real -Mobile -ApiUrl http://192.168.1.25:5064/api
```

Open on the phone:

```text
http://192.168.1.25:3000
```

If the phone cannot connect, allow inbound Windows Firewall traffic for ports
`3000` and `5064`.

## Android App Mobile

The Android app is a Capacitor shell that loads the running Next.js app. This
keeps web PC, web mobile, and app mobile on the same frontend codebase.

Check Android prerequisites first:

```powershell
.\scripts\android-doctor.ps1
```

### Emulator mock mode

Terminal 1:

```powershell
.\scripts\run-frontend-local.ps1 -Mode mock -Mobile
```

Terminal 2:

```powershell
.\scripts\run-android-local.ps1 -ServerUrl http://10.0.2.2:3000
```

### Emulator real API mode

Terminal 1:

```powershell
docker compose --profile real up -d postgres backend
.\scripts\run-frontend-local.ps1 -Mode real -Mobile -ApiUrl http://10.0.2.2:5064/api
```

Terminal 2:

```powershell
.\scripts\run-android-local.ps1 -ServerUrl http://10.0.2.2:3000
```

### Physical phone mock mode

Terminal 1:

```powershell
.\scripts\run-frontend-local.ps1 -Mode mock -Mobile
```

Terminal 2:

```powershell
.\scripts\run-android-local.ps1 -ServerUrl http://192.168.1.25:3000
```

### Physical phone real API mode

Terminal 1:

```powershell
docker compose --profile real up -d postgres backend
.\scripts\run-frontend-local.ps1 -Mode real -Mobile -ApiUrl http://192.168.1.25:5064/api
```

Terminal 2:

```powershell
.\scripts\run-android-local.ps1 -ServerUrl http://192.168.1.25:3000
```

More Android notes are in `MOBILE_APP.md`.

### Build debug APK

Emulator:

```powershell
.\scripts\build-android-debug.ps1 -ServerUrl http://10.0.2.2:3000
```

Physical phone:

```powershell
.\scripts\build-android-debug.ps1 -ServerUrl http://192.168.1.25:3000
```

APK output:

```text
frontend-app/android/app/build/outputs/apk/debug/app-debug.apk
```

### Install debug APK

Emulator:

```powershell
.\scripts\install-android-debug.ps1 -ServerUrl http://10.0.2.2:3000
```

Physical phone:

```powershell
.\scripts\install-android-debug.ps1 -ServerUrl http://192.168.1.25:3000
```

If more than one Android device is connected:

```powershell
.\scripts\install-android-debug.ps1 -ServerUrl http://192.168.1.25:3000 -DeviceId DEVICE_ID
```

## Docker Web

Use Docker when you want the app to run as containers.

### Mock mode

```powershell
.\scripts\run-app-docker.ps1 -Profile mock
```

Open:

```text
http://localhost:3000
```

### Real API mode for desktop browser

```powershell
.\scripts\run-app-docker.ps1 -Profile real
```

Open:

```text
http://localhost:3000
```

### Real API mode for phone browser

Set a phone-reachable API URL before building the Docker frontend:

```powershell
$env:NEXT_PUBLIC_API_URL_REAL="http://192.168.1.25:5064/api"
$env:CORS_ALLOWED_ORIGINS="http://localhost:3000;http://192.168.1.25:3000"
.\scripts\run-app-docker.ps1 -Profile real -NoCache
```

Open on the phone:

```text
http://192.168.1.25:3000
```

### Android app using Docker frontend

Mock mode:

```powershell
.\scripts\run-app-docker.ps1 -Profile mock -NoCache -Detached
.\scripts\run-android-local.ps1 -ServerUrl http://192.168.1.25:3000
```

Real API mode:

```powershell
$env:NEXT_PUBLIC_API_URL_REAL="http://192.168.1.25:5064/api"
$env:CORS_ALLOWED_ORIGINS="http://localhost:3000;http://192.168.1.25:3000"
.\scripts\run-app-docker.ps1 -Profile real -NoCache -Detached
.\scripts\run-android-local.ps1 -ServerUrl http://192.168.1.25:3000
```

## Quality Checks

GitHub Actions runs CI on pushes and pull requests to `main`. The workflow
checks frontend lint/tests/build, backend service tests on .NET 8, and Docker
Compose profile syntax.

Frontend:

```powershell
cd frontend-app
npm run lint
npm test -- --runInBand
npm run build
```

Backend Docker build:

```powershell
docker compose --profile real build backend
```

Backend service tests:

```powershell
.\scripts\test-backend.ps1
```

If .NET SDK 8 is installed locally:

```powershell
.\scripts\test-backend.ps1 -UseLocalDotnet
```

Basic API smoke check:

```powershell
docker compose --profile real up -d postgres backend
.\scripts\smoke-api.ps1
```

## Demo Dataset

Use this when you want the real API database to look full for development,
review, or presentation.

```powershell
.\scripts\seed-demo-data.ps1
```

The script:

1. Starts Postgres and backend through Docker Compose.
2. Creates or logs into the demo user.
3. Applies the full demo SQL dataset.
4. Prints dataset counts for validation.

Demo login:

```text
demo_full
```

Demo password:

```text
demo_full123
```

Seeded data includes completed workouts, missed workouts, upcoming workouts,
an active workout run, run history, exercises, profile data, and sample form
analysis records.

The seed is idempotent for `demo_full`: running it again resets only that demo
account's workout/profile/analysis data.

Broader local release check:

```powershell
.\scripts\verify-release.ps1
```

Useful release-check variants:

```powershell
.\scripts\verify-release.ps1 -SkipBackend
.\scripts\verify-release.ps1 -SkipFrontendTests
.\scripts\verify-release.ps1 -WithDocker
.\scripts\verify-release.ps1 -WithApiSmoke
```

`verify-release.ps1` uses a local .NET SDK when available. If the SDK is not
installed, it falls back to Docker for the backend build and prints a clear
environment error when Docker Desktop is not running.

## Common Issues

1. Phone cannot reach the app:
   - Use the computer LAN IP instead of `localhost`.
   - Allow Windows Firewall traffic for `3000` and `5064`.

2. Docker frontend calls the wrong API URL:
   - `NEXT_PUBLIC_API_URL_REAL` is baked during Docker build.
   - Rebuild with `-NoCache` after changing it.

3. Android app opens a fallback page:
   - `CAPACITOR_SERVER_URL` was not set during `cap sync`.
   - Run `.\scripts\run-android-local.ps1 -ServerUrl http://YOUR_URL:3000`.

4. Backend does not start locally:
   - Use Docker backend if the .NET SDK is not installed.
   - Outside `Development`, set `CORS_ALLOWED_ORIGINS` and a strong `Jwt__Key`.

5. Form analysis fails:
   - The upload is still saved.
   - Keep the clip short, well lit, and within the supported squat/bench press beta.
   - Check Python dependencies, model files, and backend logs if failures repeat.

## Hosting Direction

Hosting is not implemented in this step. The recommended later direction is:

1. Backend API + PostgreSQL + persistent file storage on one provider.
2. Frontend web on a hosted URL.
3. Android `CAPACITOR_SERVER_URL` pointed at the hosted frontend.

This keeps desktop web, mobile web, and Android app using the same frontend and
API contracts.
