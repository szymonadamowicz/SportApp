param(
    [string[]]$Models = @("yolov8s-pose"),
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$outputDir = Join-Path $repoRoot "backend-app/videoAnalysysModule"

$availableModels = @{
    "yolov8s-pose" = @{
        File = "yolov8s-pose.pt"
        Url = "https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8s-pose.pt"
        Sha256 = "234314CD8BAF62616791ACEB9EA6AD5C19F26CF6C0D8F3A1BFCE1E23B186CFB3"
    }
    "yolov8m-pose" = @{
        File = "yolov8m-pose.pt"
        Url = "https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8m-pose.pt"
        Sha256 = "DBE539EA268DB2534390942CFDF206E521F376F19E5415967A57F6A2DDFA3C90"
    }
    "yolov8m" = @{
        File = "yolov8m.pt"
        Url = "https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8m.pt"
        Sha256 = "5D4A90CDC7A21786CC59CD19778E9EAFFF836DF9E2DA32524737C7EE6EFE4FE5"
    }
}

if ($Models -contains "all") {
    $Models = $availableModels.Keys
}

$unknownModels = $Models | Where-Object { -not $availableModels.ContainsKey($_) }
if ($unknownModels) {
    $validModels = (@($availableModels.Keys) + "all" | Sort-Object) -join ", "
    throw "Unknown model(s): $($unknownModels -join ', '). Valid values: $validModels."
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

foreach ($modelName in $Models) {
    $model = $availableModels[$modelName]
    $target = Join-Path $outputDir $model.File
    $expectedHash = $model.Sha256.ToUpperInvariant()

    if ((Test-Path $target) -and -not $Force) {
        $currentHash = (Get-FileHash $target -Algorithm SHA256).Hash.ToUpperInvariant()
        if ($currentHash -eq $expectedHash) {
            Write-Host "$($model.File) already exists and checksum is valid."
            continue
        }

        throw "$($model.File) already exists but checksum differs. Re-run with -Force to replace it."
    }

    $tmp = "$target.tmp"
    if (Test-Path $tmp) {
        Remove-Item -LiteralPath $tmp -Force
    }

    Write-Host "Downloading $($model.File)..."
    Invoke-WebRequest -Uri $model.Url -OutFile $tmp

    $downloadedHash = (Get-FileHash $tmp -Algorithm SHA256).Hash.ToUpperInvariant()
    if ($downloadedHash -ne $expectedHash) {
        Remove-Item -LiteralPath $tmp -Force
        throw "Checksum mismatch for $($model.File). Expected $expectedHash, got $downloadedHash."
    }

    Move-Item -LiteralPath $tmp -Destination $target -Force
    Write-Host "Saved $target"
}
