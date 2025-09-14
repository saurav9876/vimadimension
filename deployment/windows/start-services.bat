@echo off
REM ===================================================================
REM VimaDimension - Start All Services
REM ===================================================================
REM This script starts MySQL, Backend, and Frontend services
REM ===================================================================

echo.
echo ===================================================================
echo Starting VimaDimension Services
echo ===================================================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo WARNING: Not running as Administrator
    echo Some operations may fail without admin privileges
    echo.
)

echo Starting MySQL Database Service...
net start VimaDimensionMySQL
if %ERRORLEVEL% equ 0 (
    echo ✓ MySQL service started successfully
) else (
    echo ✗ Failed to start MySQL service
    echo   Check if the service is installed and MySQL is properly configured
)

echo.
echo Waiting for MySQL to initialize...
timeout /t 5 /nobreak >nul

echo Starting Backend Service...
net start VimaDimensionBackend
if %ERRORLEVEL% equ 0 (
    echo ✓ Backend service started successfully
) else (
    echo ✗ Failed to start Backend service
    echo   Check if Java is installed and JAR file exists
)

echo.
echo Starting IIS (Frontend)...
net start w3svc
if %ERRORLEVEL% equ 0 (
    echo ✓ IIS/Frontend service started successfully
) else (
    echo ✗ Failed to start IIS service
    echo   Check if IIS is properly installed and configured
)

echo.
echo ===================================================================
echo Service Status Check
echo ===================================================================

echo Checking MySQL service...
sc query VimaDimensionMySQL | findstr "STATE"

echo Checking Backend service...
sc query VimaDimensionBackend | findstr "STATE"

echo Checking IIS service...
sc query w3svc | findstr "STATE"

echo.
echo ===================================================================
echo Application URLs
echo ===================================================================
echo Frontend: http://localhost/
echo Backend:   http://localhost:8080/
echo Health:    http://localhost:8080/actuator/health
echo.

echo Waiting 10 seconds for services to fully start...
timeout /t 10 /nobreak >nul

echo Testing backend health endpoint...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/actuator/health' -TimeoutSec 5; Write-Host '✓ Backend health check: ' $response.StatusDescription -ForegroundColor Green } catch { Write-Host '✗ Backend health check failed: ' $_.Exception.Message -ForegroundColor Red }"

echo.
echo All services startup completed!
echo Check the status above for any issues.
echo.
pause
