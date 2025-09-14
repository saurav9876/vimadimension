@echo off
REM ===================================================================
REM VimaDimension - Stop All Services
REM ===================================================================
REM This script stops MySQL, Backend, and Frontend services
REM ===================================================================

echo.
echo ===================================================================
echo Stopping VimaDimension Services
echo ===================================================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo WARNING: Not running as Administrator
    echo Some operations may fail without admin privileges
    echo.
)

echo Stopping Backend Service...
net stop VimaDimensionBackend
if %ERRORLEVEL% equ 0 (
    echo ✓ Backend service stopped successfully
) else (
    echo ✗ Failed to stop Backend service (may not be running)
)

echo.
echo Stopping MySQL Database Service...
net stop VimaDimensionMySQL
if %ERRORLEVEL% equ 0 (
    echo ✓ MySQL service stopped successfully
) else (
    echo ✗ Failed to stop MySQL service (may not be running)
)

echo.
echo Note: IIS (Frontend) service is not stopped as it may be used by other applications.
echo To stop IIS manually, run: net stop w3svc
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
echo All services shutdown completed!
echo.
pause
