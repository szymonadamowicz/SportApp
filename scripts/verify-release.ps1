param(
    [switch]$SkipInstall,
    [switch]$SkipBackend,
    [switch]$SkipBackendDockerFallback,
    [switch]$SkipFrontendTests,
    [switch]$SkipFrontendBuild,
    [switch]$WithDocker,
    [switch]$WithApiSmoke,
    [switch]$WithAndroidDoctor,
    [string]$AndroidSdkPath = "",
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

function Test-DockerComposeConfig {
    if (-not (Test-CommandExists "docker")) {
        Write-Host "[verify] Docker CLI was not found. Skipping Docker Compose config validation."
        return
    }

    docker compose --profile mock config --quiet
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose mock profile config validation failed."
    }

    docker compose --profile real config --quiet
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose real profile config validation failed."
    }
}

function Invoke-CheckedNative {
    param(
        [scriptblock]$Command,
        [string]$FailureMessage
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw $FailureMessage
    }
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
    Run-Step "Docker Compose config" {
        Test-DockerComposeConfig
    }

    if (-not $SkipBackend) {
        Run-Step "Backend build" {
            if ((Get-DotnetSdkCount) -gt 0) {
                Invoke-CheckedNative { dotnet build $backendProject -c Release } "Backend build failed."
                return
            }

            if ($SkipBackendDockerFallback) {
                throw "No local .NET SDK found and Docker fallback was disabled. Install .NET SDK 8 or remove -SkipBackendDockerFallback."
            }

            if (-not (Test-DockerAvailable)) {
                throw "No local .NET SDK found and Docker is not available. Install .NET SDK 8 or start Docker Desktop."
            }

            Write-Host "[verify] No local .NET SDK found. Falling back to Docker backend build."
            Invoke-CheckedNative { docker compose --profile real build backend } "Backend Docker build failed."
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
                Invoke-CheckedNative { npm ci } "Frontend install failed."
            }
        }

        Run-Step "Frontend lint" {
            Invoke-CheckedNative { npm run lint } "Frontend lint failed."
        }

        if (-not $SkipFrontendTests) {
            Run-Step "Frontend tests" {
                Invoke-CheckedNative { npm test -- --runInBand } "Frontend tests failed."
            }
        }

        if (-not $SkipFrontendBuild) {
            Run-Step "Frontend build" {
                Invoke-CheckedNative { npm run build } "Frontend build failed."
            }
        }
        else {
            Write-Host "[verify] Skipping frontend build."
        }
    }
    finally {
        Pop-Location
    }

    if ($WithAndroidDoctor) {
        Run-Step "Android setup" {
            Invoke-CheckedNative { & (Join-Path $scriptDir "android-doctor.ps1") -AndroidSdkPath $AndroidSdkPath } "Android setup check failed."
        }
    }

    if ($WithDocker -and -not $backendVerifiedWithDocker) {
        Run-Step "Backend Docker image" {
            if (-not (Test-DockerAvailable)) {
                throw "Docker is not available. Start Docker Desktop before running -WithDocker."
            }

            Invoke-CheckedNative { docker compose --profile real build backend } "Backend Docker build failed."
        }
    }

    if ($WithApiSmoke) {
        Run-Step "API smoke prerequisites" {
            if (-not (Test-DockerAvailable)) {
                throw "Docker is not available. Start Docker Desktop before running -WithApiSmoke."
            }
        }

        Run-Step "API smoke backend" {
            Invoke-CheckedNative { docker compose --profile real up -d postgres backend } "API smoke backend startup failed."
        }

        Run-Step "API smoke flow" {
            Invoke-CheckedNative { & (Join-Path $scriptDir "smoke-api.ps1") -ApiBaseUrl $ApiBaseUrl } "API smoke flow failed."
        }
    }

    Write-Host ""
    Write-Host "[verify] Release verification completed."
}
finally {
    Pop-Location
}
