param(
    [ValidateSet("real", "mock")]
    [string]$Mode = "mock",
    [string]$ApiUrl = "http://localhost:5064/api",
    [switch]$Mobile
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$frontendDir = Join-Path $repoRoot "frontend-app"

Push-Location $frontendDir
try {
    $env:NEXT_PUBLIC_API_MODE = $Mode
    $env:NEXT_PUBLIC_API_URL = $ApiUrl

    if ($Mobile) {
        npm run dev:mobile
    }
    else {
        npm run dev
    }
}
finally {
    Pop-Location
}
