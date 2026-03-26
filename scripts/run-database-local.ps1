Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")

Write-Host "[local-db] Building and starting postgres container..."
Push-Location $repoRoot
try {
    docker compose --profile real up -d --build postgres | Out-Host
    Write-Host "[local-db] Postgres is running independently."
    Write-Host "[local-db] Stop with: docker compose --profile real stop postgres"
}
finally {
    Pop-Location
}
