# RepForge Release Checklist

Use this checklist before presenting or handing off the project. The goal is to
confirm the same product works as desktop web, mobile web, and Android app, in
both mock and real API modes.

## Automated Checks

Run the broad local check:

```powershell
.\scripts\verify-release.ps1 -SkipBackend
```

Run the full check when Docker Desktop is running:

```powershell
.\scripts\verify-release.ps1 -WithDocker -WithApiSmoke
```

Run the Android environment check before building or installing the mobile app:

```powershell
.\scripts\verify-release.ps1 -SkipBackend -SkipFrontendTests -SkipFrontendBuild -WithAndroidDoctor
```

Expected result:

- Docker Compose `mock` and `real` profiles parse successfully.
- Frontend lint, tests, and production build pass.
- Backend build or backend Docker build passes.
- API smoke flow passes when `-WithApiSmoke` is used.
- Android doctor passes when Android SDK Platform 36, Build Tools, and ADB are
  installed.

## Web PC

Mock mode:

```powershell
.\scripts\run-frontend-local.ps1 -Mode mock
```

Real API mode:

```powershell
docker compose --profile real up -d postgres backend
.\scripts\run-frontend-local.ps1 -Mode real -ApiUrl http://localhost:5064/api
```

Check:

- Register/login works.
- Dashboard, Workouts, Progress, and Profile open without raw HTTP errors.
- Workout create/edit/delete works.
- Start, continue, pause, leave, resume, and finish workout work.
- Form analysis upload shows a beta state and either result or controlled
  failure UI.

## Web Mobile

Find the computer LAN IP:

```powershell
ipconfig
```

Mock mode:

```powershell
.\scripts\run-frontend-local.ps1 -Mode mock -Mobile
```

Real API mode:

```powershell
docker compose --profile real up -d postgres backend
.\scripts\run-frontend-local.ps1 -Mode real -Mobile -ApiUrl http://YOUR_LAN_IP:5064/api
```

Check on the phone browser:

- Pages fit without horizontal scrolling.
- Primary actions are thumb-friendly.
- Workout timer keeps updating after leaving and returning to a workout.
- Floating active-workout timer appears outside the workout page and does not
  cover critical actions.
- Video upload flow handles unsupported or failed analysis predictably.

## Android App Mobile

Android prerequisites:

```powershell
.\scripts\android-doctor.ps1
```

Build debug APK for a physical phone:

```powershell
.\scripts\build-android-debug.ps1 -ServerUrl http://YOUR_LAN_IP:3000
```

Install debug APK:

```powershell
.\scripts\install-android-debug.ps1 -ServerUrl http://YOUR_LAN_IP:3000
```

Check:

- The app opens the same RepForge UI as web mobile.
- The app can reach the running frontend through the LAN IP.
- In real API mode, the frontend can reach the backend through the LAN IP.
- Closing and reopening the app does not show raw network errors.

## Docker Runtime

Mock mode:

```powershell
.\scripts\run-app-docker.ps1 -Profile mock
```

Real API mode:

```powershell
.\scripts\run-app-docker.ps1 -Profile real
docker compose --profile real ps
```

Check:

- `postgres`, `backend`, and `frontend-real` are healthy in real mode.
- Backend readiness uses `/health/ready`, not only `/health`.
- API smoke test passes:

```powershell
.\scripts\smoke-api.ps1
```

## Demo Data

Prepare a full database for presentation:

```powershell
.\scripts\seed-demo-data.ps1
```

Check:

- Demo user `demo_full` can log in with `demo_full123`.
- Dashboard is populated.
- Workouts include completed, missed, upcoming, and active examples.
- Progress and form analysis pages show meaningful data.

## Known Release Boundaries

- Production hosting is not configured yet. The current release target is local
  and Docker-based development/presentation.
- Android app builds require local Android SDK tooling.
- The form analysis feature is intentionally a controlled beta for squat and
  bench press clips.
