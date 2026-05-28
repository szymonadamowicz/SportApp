param(
    [string]$ServerUrl = "http://10.0.2.2:3000",
    [switch]$Run
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$frontendDir = Join-Path $repoRoot "frontend-app"

Push-Location $frontendDir
try {
    $env:CAPACITOR_SERVER_URL = $ServerUrl
    npm run cap:sync:android

    if ($Run) {
        npm run cap:run:android
    }
    else {
        npm run cap:open:android
    }
}
finally {
    Pop-Location
}
