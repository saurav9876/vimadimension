@echo off
REM Build React frontend (Node 18 LTS recommended)

echo ========================================
echo Building frontend (React)
echo ========================================

setlocal
if not exist frontend\package.json (
  echo ERROR: Run this from repo root. frontend\package.json not found.
  exit /b 1
)

pushd frontend
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo WARNING: 'node' not found in PATH. Install Node.js 18.x LTS.
)

call npm install
if %ERRORLEVEL% neq 0 (
  echo npm install failed.
  popd
  exit /b 1
)

call npm run build
if %ERRORLEVEL% neq 0 (
  echo npm run build failed.
  popd
  exit /b 1
)

popd
echo Frontend built under frontend\build
endlocal

