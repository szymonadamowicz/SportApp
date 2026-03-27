param(
    [string]$ServerUrl = "http://10.0.2.2:3000",
    [string]$AndroidSdkPath = "",
    [string]$DeviceId = "",
    [switch]$SkipBuild
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

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$androidDir = Join-Path $repoRoot "frontend-app\android"
$apkPath = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
$sdkPath = Resolve-AndroidSdk -PreferredPath $AndroidSdkPath

if (-not $SkipBuild) {
    & (Join-Path $scriptDir "build-android-debug.ps1") -ServerUrl $ServerUrl -AndroidSdkPath $AndroidSdkPath
}

if (-not $sdkPath) {
    throw "Android SDK not found. Run scripts/android-doctor.ps1."
}

if (-not (Test-Path $apkPath)) {
    throw "APK not found. Run scripts/build-android-debug.ps1 first."
}

$adb = Join-Path $sdkPath "platform-tools\adb.exe"
if (-not (Test-Path $adb)) {
    throw "ADB not found at $adb."
}

& $adb devices
if ($DeviceId) {
    & $adb -s $DeviceId install -r $apkPath
}
else {
    & $adb install -r $apkPath
}
