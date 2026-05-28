param(
    [switch]$SkipInstall,
    [switch]$SkipFrontendTests,
    [switch]$WithDocker
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$backendProject = Join-Path $repoRoot "backend-app/apiModule/ApiModule/WebApplication1/ApiModule.csproj"
$frontendDir = Join-Path $repoRoot "frontend-app"
$backendVerifiedWithDocker = $false

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
    Run-Step "Backend build" {
        $dotnetSdks = @()
        if (Get-Command dotnet -ErrorAction SilentlyContinue) {
            $dotnetSdks = @(dotnet --list-sdks 2>$null)
        }

        if ($dotnetSdks.Count -gt 0) {
            dotnet build $backendProject -c Release
        }
        else {
            Write-Host "[verify] No local .NET SDK found. Falling back to Docker backend build."
            docker compose --profile real build backend
            $script:backendVerifiedWithDocker = $true
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
            docker compose --profile real build backend
        }
    }

    Write-Host ""
    Write-Host "[verify] Release verification completed."
}
finally {
    Pop-Location
}
