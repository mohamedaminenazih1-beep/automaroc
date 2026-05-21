# run_portable_node.ps1
# Uses the extracted portable Node v20.19.0 to install deps and start Vite
$ErrorActionPreference = 'Stop'

$nodeBin = "C:/Users/PC/Desktop/project-8543280/node/node-v20.19.0-win-x64"
# Add the portable Node folder to PATH for this session
$env:Path = "$nodeBin;$env:Path"

Write-Host "\nInstalling project dependencies ..."
& npm install

Write-Host "\nStarting development server ..."
& npm run dev
