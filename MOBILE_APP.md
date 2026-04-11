# RepForge Mobile App

The Android app is built with Capacitor. It loads the same Next.js app that is
used by desktop web and mobile web.

Current mobile app strategy:

1. Start the Next.js app on the computer.
2. Point Capacitor to that URL through `CAPACITOR_SERVER_URL`.
3. Run or install the Android app on an emulator or physical phone.

This keeps the project simple while preserving one shared frontend codebase.

## Required Tools

- Android Studio
- Android SDK Platform 36
- Android SDK Build Tools
- Android SDK Platform Tools
- Android emulator or physical Android phone
- USB debugging enabled for a physical phone

Run the local Android check:

```powershell
.\scripts\android-doctor.ps1
```

If the SDK is installed in a custom directory:

```powershell
.\scripts\android-doctor.ps1 -AndroidSdkPath C:\Android\Sdk
```

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

Build APK:

```powershell
.\scripts\build-android-debug.ps1 -ServerUrl http://10.0.2.2:3000
```

Install APK:

```powershell
.\scripts\install-android-debug.ps1 -ServerUrl http://10.0.2.2:3000
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

Build APK:

```powershell
.\scripts\build-android-debug.ps1 -ServerUrl http://10.0.2.2:3000
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

Build APK:

```powershell
.\scripts\build-android-debug.ps1 -ServerUrl http://192.168.1.25:3000
```

Install APK:

```powershell
.\scripts\install-android-debug.ps1 -ServerUrl http://192.168.1.25:3000
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

Build APK:

```powershell
.\scripts\build-android-debug.ps1 -ServerUrl http://192.168.1.25:3000
```

Install APK:

```powershell
.\scripts\install-android-debug.ps1 -ServerUrl http://192.168.1.25:3000
```

If more than one device is connected:

```powershell
.\scripts\install-android-debug.ps1 -ServerUrl http://192.168.1.25:3000 -DeviceId DEVICE_ID
```

If the phone cannot connect, allow inbound Windows Firewall traffic for ports
`3000` and `5064`.

## APK Output

Debug APK path:

```text
frontend-app/android/app/build/outputs/apk/debug/app-debug.apk
```

The debug APK loads the configured web URL. Keep the web app and backend
running on the computer, or point `CAPACITOR_SERVER_URL` to a hosted frontend
later.

## Troubleshooting

1. `Android SDK not found`
   - Install Android Studio.
   - Open SDK Manager.
   - Install Android SDK Platform 36, Build Tools, and Platform Tools.
   - Re-run `.\scripts\android-doctor.ps1`.

2. The app opens a fallback page
   - Rebuild/sync with the correct `-ServerUrl`.

3. The app cannot call the API on a physical phone
   - Use the computer LAN IP in `-ApiUrl`.
   - Allow Windows Firewall traffic for `5064`.

4. The app cannot load the frontend on a physical phone
   - Start frontend with `-Mobile`.
   - Use the computer LAN IP in `-ServerUrl`.
   - Allow Windows Firewall traffic for `3000`.
