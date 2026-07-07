$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
  $nodePath = $node.Source
} else {
  $nodePath = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
}

if (-not (Test-Path $nodePath)) {
  Write-Host "Could not find Node.js. Please install Node.js or run this from Codex with the bundled runtime available."
  Read-Host "Press Enter to close"
  exit 1
}

Write-Host "Starting Product Promo Site..."
Write-Host "Open http://localhost:5178 in your browser."
Write-Host "Press Ctrl+C to stop the site."
& $nodePath server.js
