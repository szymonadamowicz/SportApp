param(
    [string]$ApiBaseUrl = "http://localhost:5064/api"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$apiBase = $ApiBaseUrl.TrimEnd("/")
$readyUrl = $apiBase -replace "/api$", "/health/ready"
$login = "smoke_$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
$password = "SmokeTest123!"

function Invoke-Api {
    param(
        [ValidateSet("GET", "POST", "PUT", "PATCH", "DELETE")]
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Token = ""
    )

    $headers = @{}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    $uri = "$apiBase$Path"
    if ($null -ne $Body) {
        $json = $Body | ConvertTo-Json -Depth 20
        return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -ContentType "application/json" -Body $json
    }

    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers
}

Write-Host "[smoke] Checking readiness at $readyUrl"
Invoke-RestMethod -Method GET -Uri $readyUrl | Out-Null

Write-Host "[smoke] Registering temporary user $login"
$auth = Invoke-Api -Method POST -Path "/auth/register" -Body @{
    login = $login
    password = $password
    repeatPassword = $password
}
$token = $auth.Token
if (-not $token) {
    throw "Register did not return a token."
}

Write-Host "[smoke] Creating workout"
$workout = Invoke-Api -Method POST -Path "/workouts" -Token $token -Body @{
    title = "Smoke release workout"
    scheduledAt = [DateTime]::UtcNow.ToString("o")
    muscleGroups = @("qa")
    exercises = @(
        @{
            orderIndex = 0
            name = "Smoke squat"
            sets = 1
            reps = 5
            restTimeSec = 30
            weight = 20
        }
    )
}

$workoutId = $workout.Id
$exercise = $workout.Exercises[0]
$exerciseId = $exercise.Id

Write-Host "[smoke] Starting workout run"
$run = Invoke-Api -Method POST -Path "/workout-runs/start/$workoutId" -Token $token
$runId = $run.RunId
if (-not $runId) {
    throw "Start workout run did not return runId."
}

$entry = @{
    stepIndex = 0
    exerciseId = $exerciseId
    exerciseName = "Smoke squat"
    setNumber = 1
    expectedReps = 5
    actualReps = 5
    metTarget = $true
    exerciseDurationSec = 24
    restDurationSec = 0
    completedAt = [DateTime]::UtcNow.ToString("o")
}

Write-Host "[smoke] Saving run progress"
Invoke-Api -Method POST -Path "/workout-runs/$runId/progress" -Token $token -Body @{
    durationSec = 24
    notes = "smoke progress"
    activePhase = "exercise"
    currentStepIndex = 0
    remainingSeconds = 0
    phaseDurationSec = 24
    isPaused = $false
    entries = @($entry)
} | Out-Null

Write-Host "[smoke] Completing workout run"
$summary = Invoke-Api -Method POST -Path "/workout-runs/$runId/complete" -Token $token -Body @{
    durationSec = 42
    notes = "smoke complete"
    entries = @($entry)
}

if ($summary.TotalSets -ne 1 -or $summary.MetTargetSets -ne 1) {
    throw "Unexpected workout summary."
}

Write-Host "[smoke] Reading progress"
Invoke-Api -Method GET -Path "/progress" -Token $token | Out-Null

Write-Host "[smoke] API smoke flow completed."
