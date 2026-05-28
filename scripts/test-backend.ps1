param(
    [switch]$UseLocalDotnet
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$testProject = Join-Path $repoRoot "backend-app/apiModule/ApiModule/WebApplication1.Tests/WebApplication1.Tests.csproj"

if ($UseLocalDotnet) {
    dotnet test $testProject --nologo
    exit $LASTEXITCODE
}

docker run --rm `
    -v "${repoRoot}:/src" `
    -w /src/backend-app/apiModule/ApiModule/WebApplication1.Tests `
    mcr.microsoft.com/dotnet/sdk:8.0 `
    dotnet test --nologo
exit $LASTEXITCODE
