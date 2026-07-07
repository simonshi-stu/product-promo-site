@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel%==0 (
  set "NODE=node"
) else (
  set "NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)

if not exist "%NODE%" if not "%NODE%"=="node" (
  echo Could not find Node.js.
  echo Please install Node.js or run this from Codex with the bundled runtime available.
  pause
  exit /b 1
)

echo Starting Product Promo Site...
echo Open http://localhost:5178 in your browser.
echo Press Ctrl+C to stop the site.
"%NODE%" server.js
pause
