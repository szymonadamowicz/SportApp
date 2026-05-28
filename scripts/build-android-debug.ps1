param(
    [string]$ServerUrl = "http://10.0.2.2:3000",
    [string]$AndroidSdkPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-AndroidSdk {
    param([string]$PreferredPath)

    $candidates = @(
        $PreferredPath,
        [Environment]::GetEnvironmentVariable("ANDROID_HOME"),
        [Environment]::GetEnvironmentVariable("ANDROID_SDK_ROOT"),
        (Join-Path ([Environment]::GetFolderPath("LocalApplicationData")) "Android\Sdk")
    ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

    foreach ($candidate in $candidates) {
        $resolved = Resolve-Path $candidate -ErrorAction SilentlyContinue
        if ($resolved) {
            return $resolved.Path
        }
    }

    return ""
}

function Set-AndroidLocalProperties {
    param(
        [string]$AndroidDir,
        [string]$SdkPath
    )

    $normalizedSdkPath = $SdkPath.Replace("\", "/")
    Set-Content -Path (Join-Path $AndroidDir "local.properties") -Value "sdk.dir=$normalizedSdkPath"
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$frontendDir = Join-Path $repoRoot "frontend-app"
$androidDir = Join-Path $frontendDir "android"
$sdkPath = Resolve-AndroidSdk -PreferredPath $AndroidSdkPath

if (-not $sdkPath) {
    throw "Android SDK not found. Run scripts/android-doctor.ps1 after installing Android Studio and SDK Platform 36."
}

Set-AndroidLocalProperties -AndroidDir $androidDir -SdkPath $sdkPath

Push-Location $frontendDir
try {
    $env:CAPACITOR_SERVER_URL = $ServerUrl
    npm run cap:sync:android
}
finally {
    Pop-Location
}

Push-Location $androidDir
try {
    .\gradlew.bat assembleDebug
}
finally {
    Pop-Location
}

$apkPath = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apkPath)) {
    throw "APK build finished but app-debug.apk was not found."
}

Write-Host "[android-build] APK ready: $apkPath"
