param(
    [ValidateSet("real", "mock")]
    [string]$Profile = "mock",
    [switch]$Detached,
    [switch]$NoCache
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")

$frontendService = if ($Profile -eq "real") { "frontend-real" } else { "frontend-mock" }

Push-Location $repoRoot
try {
    Write-Host "[docker-run] Stopping current stack to avoid stale profile state..."
    docker compose down --remove-orphans | Out-Host

    if ($NoCache) {
        Write-Host "[docker-run] Rebuilding $frontendService without cache..."
        docker compose --profile $Profile build --no-cache $frontendService | Out-Host
    }

    $upArgs = @("compose", "--profile", $Profile, "up", "--build")
    if ($Detached) {
        $upArgs += "-d"
    }

    Write-Host "[docker-run] Starting profile '$Profile'..."
    & docker @upArgs | Out-Host

    if ($Detached) {
        Write-Host "[docker-run] Running in background. Logs: docker compose --profile $Profile logs -f"
        docker compose --profile $Profile ps | Out-Host
    }
}
finally {
    Pop-Location
}
