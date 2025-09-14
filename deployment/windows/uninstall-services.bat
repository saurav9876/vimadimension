@echo off
REM ===================================================================
REM VimaDimension - Uninstall All Services
REM ===================================================================
REM This script removes MySQL, Backend services and IIS site
REM Run as Administrator
REM ===================================================================

echo.
echo ===================================================================
echo Uninstalling VimaDimension Services
echo ===================================================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

set NSSM_PATH=%~dp0nssm.exe

if not exist "%NSSM_PATH%" (
    echo ERROR: NSSM not found at %NSSM_PATH%
    echo Please ensure NSSM is available or run install-services.bat first
    pause
    exit /b 1
)

echo Stopping and removing Backend Service...
net stop VimaDimensionBackend >nul 2>&1
"%NSSM_PATH%" remove VimaDimensionBackend confirm
if %ERRORLEVEL% equ 0 (
    echo ✓ Backend service removed successfully
) else (
    echo ✗ Failed to remove Backend service (may not exist)
)

echo.
echo Stopping and removing MySQL Service...
net stop VimaDimensionMySQL >nul 2>&1
"%NSSM_PATH%" remove VimaDimensionMySQL confirm
if %ERRORLEVEL% equ 0 (
    echo ✓ MySQL service removed successfully
) else (
    echo ✗ Failed to remove MySQL service (may not exist)
)

echo.
echo Removing IIS Site...
powershell -Command "& {Import-Module WebAdministration; if (Get-Website -Name 'VimaDimensionFrontend' -ErrorAction SilentlyContinue) { Remove-Website -Name 'VimaDimensionFrontend' -Confirm:\$false; Write-Host '✓ IIS site removed successfully' } else { Write-Host '✗ IIS site not found (may not exist)' }}"

echo.
echo Removing Firewall Rules...
netsh advfirewall firewall delete rule name="VimaDimension-HTTP" >nul 2>&1
netsh advfirewall firewall delete rule name="VimaDimension-Backend" >nul 2>&1
netsh advfirewall firewall delete rule name="VimaDimension-MySQL" >nul 2>&1
echo ✓ Firewall rules removed

echo.
echo ===================================================================
echo Uninstallation Complete!
echo ===================================================================
echo.
echo All VimaDimension services have been removed.
echo.
echo Note: This does not uninstall:
echo - Java JDK
echo - Node.js
echo - IIS (only the VimaDimension site was removed)
echo - MySQL Server (only the VimaDimension service was removed)
echo.
echo To completely remove the application:
echo 1. Delete the project folder
echo 2. Uninstall MySQL Server if not needed
echo 3. Uninstall Java JDK if not needed
echo 4. Uninstall Node.js if not needed
echo.
pause
