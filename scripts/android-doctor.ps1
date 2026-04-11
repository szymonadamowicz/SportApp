param(
    [string]$AndroidSdkPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$requiredPlatform = "android-36"

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

function Test-RequiredPath {
    param(
        [string]$Label,
        [string]$Path
    )

    $exists = Test-Path $Path
    $mark = if ($exists) { "OK" } else { "MISSING" }
    Write-Host ("[android-doctor] {0}: {1} ({2})" -f $Label, $mark, $Path)
    return $exists
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$androidDir = Join-Path $repoRoot "frontend-app\android"
$sdkPath = Resolve-AndroidSdk -PreferredPath $AndroidSdkPath
$ok = $true

Write-Host "[android-doctor] Android project: $androidDir"

if (-not $sdkPath) {
    Write-Host "[android-doctor] Android SDK: MISSING"
    Write-Host "[android-doctor] Install Android Studio, open SDK Manager, and install Android SDK Platform 36 plus Platform Tools."
    exit 1
}

Write-Host "[android-doctor] Android SDK: $sdkPath"
$ok = (Test-RequiredPath "Gradle wrapper" (Join-Path $androidDir "gradlew.bat")) -and $ok
$ok = (Test-RequiredPath "ADB" (Join-Path $sdkPath "platform-tools\adb.exe")) -and $ok
$ok = (Test-RequiredPath "SDK platform $requiredPlatform" (Join-Path $sdkPath "platforms\$requiredPlatform\android.jar")) -and $ok

$buildToolsDir = Join-Path $sdkPath "build-tools"
$hasBuildTools = (Test-Path $buildToolsDir) -and ((Get-ChildItem $buildToolsDir -Directory -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0)
$mark = if ($hasBuildTools) { "OK" } else { "MISSING" }
Write-Host "[android-doctor] Build Tools: $mark ($buildToolsDir)"
$ok = $hasBuildTools -and $ok

if (-not $ok) {
    Write-Host "[android-doctor] Android setup is incomplete."
    exit 1
}

Write-Host "[android-doctor] Android setup looks ready."
