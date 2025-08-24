@echo off
REM Configure Windows Firewall for VimaDimension
REM This script must be run as Administrator

echo ========================================
echo Configuring Windows Firewall for VimaDimension
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

echo Configuring firewall rules...

REM Allow inbound connections on port 8080 (Application)
netsh advfirewall firewall add rule name="VimaDimension HTTP" dir=in action=allow protocol=TCP localport=8080

REM Allow inbound connections on port 3306 (MySQL Database)
netsh advfirewall firewall add rule name="VimaDimension MySQL" dir=in action=allow protocol=TCP localport=3306

REM Allow Docker containers through firewall
netsh advfirewall firewall add rule name="Docker Containers" dir=in action=allow protocol=TCP localport=8080

echo.
echo ========================================
echo FIREWALL CONFIGURED SUCCESSFULLY!
echo ========================================
echo.
echo The following ports are now open:
echo - Port 8080: VimaDimension Application (HTTP)
echo - Port 3306: MySQL Database
echo.
echo Your application will be accessible at:
echo - Local: http://localhost:8080
echo - External: http://YOUR_STATIC_IP:8080
echo.
echo Note: Make sure your router/ISP also allows these ports
echo.
pause
