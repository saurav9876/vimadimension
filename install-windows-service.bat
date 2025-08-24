@echo off
REM Install VimaDimension as Windows Service
REM This script uses NSSM to create a Windows service

echo ========================================
echo Installing VimaDimension as Windows Service
echo ========================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: This script must be run as Administrator
    echo Right-click and select "Run as Administrator"
    pause
    exit /b 1
)

REM Download NSSM if not present
if not exist "nssm.exe" (
    echo Downloading NSSM (Non-Sucking Service Manager)...
    powershell -Command "Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile 'nssm.zip'"
    powershell -Command "Expand-Archive -Path 'nssm.zip' -DestinationPath 'nssm' -Force"
    copy "nssm\win64\nssm.exe" "nssm.exe"
    rmdir /s /q "nssm"
    del "nssm.zip"
)

REM Get current directory
set CURRENT_DIR=%CD%

REM Install the service
echo Installing VimaDimension service...
nssm.exe install VimaDimension "C:\Windows\System32\cmd.exe" "/c cd /d %CURRENT_DIR% && docker-compose -f docker-compose.prod.yml up -d"

REM Set service properties
nssm.exe set VimaDimension AppDirectory "%CURRENT_DIR%"
nssm.exe set VimaDimension Description "VimaDimension Project Management Application"
nssm.exe set VimaDimension Start SERVICE_AUTO_START
nssm.exe set VimaDimension AppStopMethodSkip 0
nssm.exe set VimaDimension AppStopMethodConsole 1500
nssm.exe set VimaDimension AppStopMethodWindow 1500
nssm.exe set VimaDimension AppStopMethodThreads 1500

REM Start the service
echo Starting VimaDimension service...
net start VimaDimension

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo SERVICE INSTALLED SUCCESSFULLY!
    echo ========================================
    echo.
    echo Service Name: VimaDimension
    echo Startup Type: Automatic
    echo Status: Running
    echo.
    echo The service will now start automatically when Windows boots
    echo.
    echo Useful commands:
    echo - Start: net start VimaDimension
    echo - Stop: net stop VimaDimension
    echo - Status: sc query VimaDimension
    echo - Remove: nssm.exe remove VimaDimension delete
) else (
    echo.
    echo ERROR: Failed to start the service
    echo Check Windows Event Viewer for details
)

echo.
pause
