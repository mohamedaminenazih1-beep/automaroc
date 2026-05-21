# setup_and_start.ps1 - Robust bootstrap for AutoMaroc project
# This script:
#   1. Checks if Node.js is available and meets Vite's minimum version (>=20.19.0).
#   2. If Node is missing or too old, it downloads a portable Node zip (v20.19.0), extracts it, and adds it to PATH.
#   3. Installs npm dependencies.
#   4. Starts the Vite dev server.

$ErrorActionPreference = 'Stop'

function Get-NodeVersion {
    try {
        $ver = node -v 2>$null
        if ($ver) { return $ver.TrimStart('v') } else { return $null }
    } catch { return $null }
}

$requiredVersion = [Version]'20.19.0'
$nodeVersion = Get-NodeVersion

if ($nodeVersion) {
    $current = [Version]$nodeVersion
    if ($current -lt $requiredVersion) { $nodeVersion = $null }
}

if (-not $nodeVersion) {
    Write-Host "Node.js not found or version too old. Installing portable Node $requiredVersion..."
    $nodeVersion = "v$requiredVersion"
    $nodeZip = "node-$nodeVersion-win-x64.zip"
    $nodeUrl = "https://nodejs.org/dist/$nodeVersion/$nodeZip"
    $destZip = Join-Path $PSScriptRoot $nodeZip
    $nodeDir = Join-Path $PSScriptRoot 'node'

    if (-not (Test-Path $destZip)) {
        Write-Host "Downloading $nodeZip ..."
        Invoke-WebRequest -Uri $nodeUrl -OutFile $destZip -UseBasicParsing
    }
    if (-not (Test-Path $nodeDir)) {
        Write-Host "Extracting Node..."
        Expand-Archive -Path $destZip -DestinationPath $nodeDir -Force
    }
    $nodeBin = Join-Path $nodeDir "node-$nodeVersion-win-x64"
    $env:Path = "$nodeBin;$env:Path"
    $npmCmd = "$nodeBin\npm.cmd"
} else {
    Write-Host "Node.js $nodeVersion detected."
    $npmCmd = "npm"
}

Write-Host "\nInstalling project dependencies ..."
& $npmCmd install

Write-Host "\nStarting development server ..."
& $npmCmd run dev
