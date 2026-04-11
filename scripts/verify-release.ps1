param(
    [switch]$SkipInstall,
    [switch]$SkipBackend,
    [switch]$SkipBackendDockerFallback,
    [switch]$SkipFrontendTests,
    [switch]$WithDocker,
    [switch]$WithApiSmoke,
    [string]$ApiBaseUrl = "http://localhost:5064/api"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$backendProject = Join-Path $repoRoot "backend-app/apiModule/ApiModule/WebApplication1/ApiModule.csproj"
$frontendDir = Join-Path $repoRoot "frontend-app"
$backendVerifiedWithDocker = $false

function Test-CommandExists {
    param([string]$Name)

    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-DockerAvailable {
    if (-not (Test-CommandExists "docker")) {
        return $false
    }

    docker info *> $null
    return $LASTEXITCODE -eq 0
}

function Get-DotnetSdkCount {
    if (-not (Test-CommandExists "dotnet")) {
        return 0
    }

    $sdks = @(dotnet --list-sdks 2>$null)
    return $sdks.Count
}

function Run-Step {
    param(
        [string]$Name,
        [scriptblock]$Command
    )

    Write-Host ""
    Write-Host "[verify] $Name"
    & $Command
}

Push-Location $repoRoot
try {
    if (-not $SkipBackend) {
        Run-Step "Backend build" {
            if ((Get-DotnetSdkCount) -gt 0) {
                dotnet build $backendProject -c Release
                return
            }

            if ($SkipBackendDockerFallback) {
                throw "No local .NET SDK found and Docker fallback was disabled. Install .NET SDK 8 or remove -SkipBackendDockerFallback."
            }

            if (-not (Test-DockerAvailable)) {
                throw "No local .NET SDK found and Docker is not available. Install .NET SDK 8 or start Docker Desktop."
            }

            Write-Host "[verify] No local .NET SDK found. Falling back to Docker backend build."
            docker compose --profile real build backend
            $script:backendVerifiedWithDocker = $true
        }
    }
    else {
        Write-Host "[verify] Skipping backend build."
    }

    Run-Step "Frontend prerequisites" {
        if (-not (Test-CommandExists "npm")) {
            throw "npm was not found. Install Node.js 20+ and npm."
        }
    }

    Push-Location $frontendDir
    try {
        if (-not $SkipInstall -and -not (Test-Path "node_modules")) {
            Run-Step "Frontend install" {
                npm ci
            }
        }

        Run-Step "Frontend lint" {
            npm run lint
        }

        if (-not $SkipFrontendTests) {
            Run-Step "Frontend tests" {
                npm test -- --runInBand
            }
        }

        Run-Step "Frontend build" {
            npm run build
        }
    }
    finally {
        Pop-Location
    }

    if ($WithDocker -and -not $backendVerifiedWithDocker) {
        Run-Step "Backend Docker image" {
            if (-not (Test-DockerAvailable)) {
                throw "Docker is not available. Start Docker Desktop before running -WithDocker."
            }

            docker compose --profile real build backend
        }
    }

    if ($WithApiSmoke) {
        Run-Step "API smoke prerequisites" {
            if (-not (Test-DockerAvailable)) {
                throw "Docker is not available. Start Docker Desktop before running -WithApiSmoke."
            }
        }

        Run-Step "API smoke backend" {
            docker compose --profile real up -d postgres backend
        }

        Run-Step "API smoke flow" {
            & (Join-Path $scriptDir "smoke-api.ps1") -ApiBaseUrl $ApiBaseUrl
        }
    }

    Write-Host ""
    Write-Host "[verify] Release verification completed."
}
finally {
    Pop-Location
}
