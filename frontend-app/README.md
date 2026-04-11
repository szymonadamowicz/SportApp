# RepForge Frontend

This folder contains the shared Next.js frontend used by:

- desktop web,
- mobile web,
- the Capacitor Android shell.

Use the root `README.md` as the main project runbook. The notes below are only
for frontend-specific commands.

## Data Modes

The frontend supports two API modes:

- `mock` uses browser-local mock repositories and does not need the backend.
- `real` calls the ASP.NET Core API.

The local helper script sets the required environment variables for development:

```powershell
..\scripts\run-frontend-local.ps1 -Mode mock
..\scripts\run-frontend-local.ps1 -Mode real -ApiUrl http://localhost:5064/api
```

For phone testing, run the frontend on the LAN interface:

```powershell
..\scripts\run-frontend-local.ps1 -Mode mock -Mobile
```

## Direct npm Commands

```powershell
npm run dev
npm run lint
npm test -- --runInBand
npm run build
```

Direct `npm run dev` uses the environment from `.env.local` or process
variables. Prefer the helper scripts when switching between `mock`, `real`, web
mobile, and Android workflows.

## Capacitor

The Android project lives in `frontend-app/android`. The app loads a running web
server through `CAPACITOR_SERVER_URL`.

Common commands from the repository root:

```powershell
.\scripts\android-doctor.ps1
.\scripts\run-android-local.ps1 -ServerUrl http://10.0.2.2:3000
.\scripts\build-android-debug.ps1 -ServerUrl http://192.168.1.25:3000
```

See `../MOBILE_APP.md` and `../README.md` for the full mobile workflow.
