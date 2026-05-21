# bootstrap_portable.ps1
# Uses the extracted portable Node v20.19.0 to install deps and run Vite.
$ErrorActionPreference = 'Stop'

$nodeBin = "C:/Users/PC/Desktop/project-8543280/node/node-v20.19.0-win-x64"
# Add portable node to PATH for this session
$env:Path = "$nodeBin;$env:Path"

Write-Host "\nInstalling project dependencies ..."
& "$nodeBin/npm.cmd" install

Write-Host "\nStarting development server ..."
& "$nodeBin/npm.cmd" run dev
