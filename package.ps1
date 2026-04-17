Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$releaseDir = Join-Path $root "release\\FoodPlan-Windows"
$zipPath = Join-Path $root "release\\FoodPlan-Windows.zip"

Push-Location $root
try {
    npm run build

    if (Test-Path $releaseDir) {
        Remove-Item -LiteralPath $releaseDir -Recurse -Force
    }

    dotnet publish ".\\launcher\\FoodPlan.Launcher.csproj" `
        -c Release `
        -r win-x64 `
        --self-contained true `
        -p:PublishSingleFile=true `
        -p:IncludeNativeLibrariesForSelfExtract=true `
        -o $releaseDir

    Copy-Item ".\\README.md" (Join-Path $releaseDir "README.txt")

    if (Test-Path $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    Compress-Archive -Path (Join-Path $releaseDir "*") -DestinationPath $zipPath
}
finally {
    Pop-Location
}
