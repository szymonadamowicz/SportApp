param(
    [string]$ApiBaseUrl = "http://localhost:5064/api",
    [string]$Login = "demo_full",
    [string]$Password = "demo_full123",
    [switch]$SkipStart
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$seedPath = Join-Path $scriptDir "dev-seed-full-demo.sql"
$apiBase = $ApiBaseUrl.TrimEnd("/")
$readyUrl = $apiBase -replace "/api$", "/health/ready"
$configuredPostgresUser = [Environment]::GetEnvironmentVariable("POSTGRES_USER")
$configuredPostgresDb = [Environment]::GetEnvironmentVariable("POSTGRES_DB")
$postgresUser = if ($configuredPostgresUser) { $configuredPostgresUser } else { "workout_user" }
$postgresDb = if ($configuredPostgresDb) { $configuredPostgresDb } else { "workoutdb" }

function Wait-Api {
    $deadline = (Get-Date).AddSeconds(90)

    do {
        try {
            Invoke-RestMethod -Method GET -Uri $readyUrl -TimeoutSec 5 | Out-Null
            return
        }
        catch {
            Start-Sleep -Seconds 2
        }
    } while ((Get-Date) -lt $deadline)

    throw "API did not become ready at $readyUrl."
}

function Invoke-Auth {
    param(
        [string]$Path,
        [object]$Body
    )

    $json = $Body | ConvertTo-Json -Depth 10
    Invoke-RestMethod -Method POST -Uri "$apiBase$Path" -ContentType "application/json" -Body $json
}

function Ensure-DemoUser {
    $registerBody = @{
        login = $Login
        password = $Password
        repeatPassword = $Password
    }

    try {
        $registered = Invoke-Auth -Path "/auth/register" -Body $registerBody
        if ($registered.Token) {
            Write-Host "[seed] Registered demo user '$Login'."
            return
        }
    }
    catch {
        Write-Host "[seed] Demo user may already exist, trying login..."
    }

    $loginBody = @{
        login = $Login
        password = $Password
    }

    $loggedIn = Invoke-Auth -Path "/auth/login" -Body $loginBody
    if (-not $loggedIn.Token) {
        throw "Demo user '$Login' exists but login failed. Use password '$Password' or recreate the database."
    }

    Write-Host "[seed] Demo user '$Login' already exists."
}

function Invoke-PsqlText {
    param([string]$Sql)

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = $Sql | docker exec -i api-postgres psql -v ON_ERROR_STOP=1 -U $postgresUser -d $postgresDb 2>&1
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if ($exitCode -ne 0) {
        $output | Out-Host
        throw "psql command failed."
    }

    return $output
}

Push-Location $repoRoot
try {
    if (-not $SkipStart) {
        Write-Host "[seed] Starting real Docker backend..."
        docker compose --profile real up -d postgres backend | Out-Host
    }

    Wait-Api
    Ensure-DemoUser

    Write-Host "[seed] Applying demo dataset..."
    $seedSql = Get-Content $seedPath -Raw
    Invoke-PsqlText -Sql $seedSql | Out-Host

    Write-Host "[seed] Validating demo dataset..."
    $validationSql = @"
SELECT
    count(DISTINCT w."Id") AS workouts,
    count(DISTINCT w."Id") FILTER (WHERE w."CompletedAt" IS NOT NULL) AS completed,
    count(DISTINCT r."Id") FILTER (WHERE r."FinishedAt" IS NULL) AS active_runs,
    count(DISTINCT fa."Id") AS form_analyses
FROM "Users" u
LEFT JOIN "Workouts" w ON w."OwnerUserId" = u."Id"
LEFT JOIN "WorkoutRuns" r ON r."WorkoutId" = w."Id"
LEFT JOIN "FormAnalyses" fa ON fa."OwnerUserId" = u."Id"
WHERE u."Login" = '$Login';
"@

    Invoke-PsqlText -Sql $validationSql | Out-Host

    Write-Host "[seed] Demo account ready: $Login / $Password"
}
finally {
    Pop-Location
}
