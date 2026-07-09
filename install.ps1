# LARP Installer for Windows (PowerShell)
# Usage: irm https://raw.githubusercontent.com/shadowytop21/larp/main/install.ps1 | iex
# Or:    .\install.ps1

$ErrorActionPreference = 'Stop'

$REPO       = 'shadowytop21/larp'
$BIN_NAME   = 'larp.exe'
$INSTALL_DIR = "$env:LOCALAPPDATA\larp\bin"

Write-Host ''
Write-Host '  LARP Installer for Windows' -ForegroundColor Cyan
Write-Host '  =========================' -ForegroundColor DarkGray
Write-Host ''

# -- 1. Determine download URL -------------------------------------------------
$releaseUrl = "https://api.github.com/repos/$REPO/releases/latest"
$downloadUrl = $null
$localFallback = $null

try {
    $release = Invoke-RestMethod -Uri $releaseUrl -UseBasicParsing
    $asset   = $release.assets | Where-Object { $_.name -like '*win*' -and $_.name -like '*.exe' } | Select-Object -First 1
    if (-not $asset) {
        throw 'No Windows binary found in the latest release.'
    }
    $downloadUrl = $asset.browser_download_url
    $version     = $release.tag_name
    Write-Host "  Latest version: $version" -ForegroundColor Green
} catch {
    Write-Host '  Could not fetch latest release from GitHub.' -ForegroundColor Yellow
    Write-Host '  Looking for local binary...' -ForegroundColor Yellow
    $localBin = Join-Path $PSScriptRoot 'bin\larp-lang-win.exe'
    if (Test-Path $localBin) {
        Write-Host "  Found local binary: $localBin" -ForegroundColor Green
        $localFallback = $localBin
    } else {
        Write-Host '  ERROR: No binary found. Place larp-lang-win.exe in .\bin\ or check your internet.' -ForegroundColor Red
        exit 1
    }
}

# -- 2. Create install directory ------------------------------------------------
if (-not (Test-Path $INSTALL_DIR)) {
    New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
    Write-Host "  Created: $INSTALL_DIR" -ForegroundColor DarkGray
}

$destPath = Join-Path $INSTALL_DIR $BIN_NAME

# -- 3. Download or copy binary ------------------------------------------------
if ($downloadUrl) {
    Write-Host "  Downloading $BIN_NAME..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $downloadUrl -OutFile $destPath -UseBasicParsing
} elseif ($localFallback) {
    Write-Host '  Copying local binary...' -ForegroundColor Yellow
    Copy-Item -Path $localFallback -Destination $destPath -Force
}

Write-Host "  Installed to: $destPath" -ForegroundColor Green

# -- 4. Add to PATH (user-level, persistent) -----------------------------------
$currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($currentPath -notlike "*$INSTALL_DIR*") {
    [Environment]::SetEnvironmentVariable('Path', "$currentPath;$INSTALL_DIR", 'User')
    Write-Host "  Added $INSTALL_DIR to your user PATH." -ForegroundColor Green
    Write-Host ''
    Write-Host '  IMPORTANT: You must CLOSE this terminal and open a NEW one for the larp command to work.' -ForegroundColor Yellow
} else {
    Write-Host "  PATH already contains $INSTALL_DIR - skipping." -ForegroundColor DarkGray
}

# -- 5. Quick smoke test -------------------------------------------------------
Write-Host ''
try {
    $versionOutput = & $destPath version 2>&1
    Write-Host "  Smoke test:  $versionOutput" -ForegroundColor Green
} catch {
    Write-Host '  Smoke test failed - the binary may need a newer OS or runtime.' -ForegroundColor Red
}

Write-Host ''
Write-Host '  Done! Please open a completely new terminal window and type `larp version` to confirm it worked.' -ForegroundColor Cyan
Write-Host ''
