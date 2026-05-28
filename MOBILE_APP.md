# RepForge Mobile App

The Android app is built with Capacitor. It loads the same Next.js app that is
used by desktop web and mobile web.

Current mobile app strategy:

1. Start the Next.js app on the computer.
2. Point Capacitor to that URL through `CAPACITOR_SERVER_URL`.
3. Run the Android app on an emulator or physical phone.

This keeps the project simple while preserving one shared frontend codebase.

## Required Tools

- Android Studio
- Android SDK
- Android emulator or physical Android phone
- USB debugging enabled for a physical phone

## Emulator

The Android emulator reaches the host computer through `10.0.2.2`.

### Mock mode

Terminal 1:

```powershell
.\scripts\run-frontend-local.ps1 -Mode mock -Mobile
```

Terminal 2:

```powershell
.\scripts\run-android-local.ps1 -ServerUrl http://10.0.2.2:3000
```

### Real API mode

Terminal 1:

```powershell
docker compose --profile real up -d postgres backend
.\scripts\run-frontend-local.ps1 -Mode real -Mobile -ApiUrl http://10.0.2.2:5064/api
```

Terminal 2:

```powershell
.\scripts\run-android-local.ps1 -ServerUrl http://10.0.2.2:3000
```

## Physical Phone

The phone must be on the same Wi-Fi network as the computer. Use the computer
LAN IP address, for example `192.168.1.25`.

### Mock mode

Terminal 1:

```powershell
.\scripts\run-frontend-local.ps1 -Mode mock -Mobile
```

Terminal 2:

```powershell
.\scripts\run-android-local.ps1 -ServerUrl http://192.168.1.25:3000
```

### Real API mode

Terminal 1:

```powershell
docker compose --profile real up -d postgres backend
.\scripts\run-frontend-local.ps1 -Mode real -Mobile -ApiUrl http://192.168.1.25:5064/api
```

Terminal 2:

```powershell
.\scripts\run-android-local.ps1 -ServerUrl http://192.168.1.25:3000
```

If the phone cannot connect, allow inbound Windows Firewall traffic for ports
`3000` and `5064`.

## Build Debug APK

After Android SDK is configured:

```powershell
cd frontend-app
$env:CAPACITOR_SERVER_URL="http://192.168.1.25:3000"
npm run cap:sync:android
cd android
.\gradlew.bat assembleDebug
```

APK path:

```text
frontend-app/android/app/build/outputs/apk/debug/app-debug.apk
```

The debug APK still loads the configured web URL. Keep the web app and backend
running on the computer, or point `CAPACITOR_SERVER_URL` to a hosted frontend
later.
