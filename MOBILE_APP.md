# RepForge Mobile App

Capacitor is configured as a native Android shell for the existing Next.js app.
The web app remains unchanged for desktop and mobile browsers.

## Targets

1. Web PC: `npm run dev`
2. Web mobile: `npm run dev:mobile`, then open the PC LAN URL on the phone
3. Android app: Capacitor shell loading the same web app through `CAPACITOR_SERVER_URL`

## Android Emulator

Use `10.0.2.2` from the emulator to reach services running on the host machine.

```powershell
cd frontend-app

$env:NEXT_PUBLIC_API_MODE="real"
$env:NEXT_PUBLIC_API_URL="http://10.0.2.2:5064/api"
npm run dev:mobile
```

In another terminal:

```powershell
cd frontend-app

$env:CAPACITOR_SERVER_URL="http://10.0.2.2:3000"
npm run cap:sync:android
npm run cap:open:android
```

## Physical Phone

Use the computer LAN IP address, for example `192.168.1.25`.

```powershell
cd frontend-app

$env:NEXT_PUBLIC_API_MODE="real"
$env:NEXT_PUBLIC_API_URL="http://192.168.1.25:5064/api"
npm run dev:mobile
```

In another terminal:

```powershell
cd frontend-app

$env:CAPACITOR_SERVER_URL="http://192.168.1.25:3000"
npm run cap:sync:android
npm run cap:open:android
```

The backend also needs to be reachable from the phone. If Docker or Windows
Firewall blocks the port, allow inbound traffic for ports `3000` and `5064`.

## Notes

- `frontend-app/capacitor-web` is only a fallback bundle. The Android shell
  loads the URL configured through `CAPACITOR_SERVER_URL`.
- This avoids forcing the current Next.js dynamic routes into static export.
- When a hosted web URL exists later, point `CAPACITOR_SERVER_URL` at it and
  run `npm run cap:sync:android`.
