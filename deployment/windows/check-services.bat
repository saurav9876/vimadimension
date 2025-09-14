@echo off
REM ===================================================================
REM VimaDimension - Service Status Checker
REM ===================================================================
REM This script checks the status of all VimaDimension services
REM ===================================================================

echo.
echo ===================================================================
echo VimaDimension Service Status Check
echo ===================================================================
echo.

REM Function to check service status
:check_service
set service_name=%1
echo Checking %service_name%...
sc query "%service_name%" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=4" %%i in ('sc query "%service_name%" ^| findstr "STATE"') do (
        if "%%i"=="RUNNING" (
            echo ✓ %service_name% is RUNNING
        ) else (
            echo ✗ %service_name% is %%i
        )
    )
) else (
    echo ✗ %service_name% is NOT INSTALLED
)
echo.
goto :eof

REM Check all services
call :check_service "VimaDimensionMySQL"
call :check_service "VimaDimensionBackend"
call :check_service "W3SVC"

echo ===================================================================
echo Application Health Check
echo ===================================================================
echo.

echo Testing Backend Health Endpoint...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/actuator/health' -TimeoutSec 10; Write-Host '✓ Backend Health: ' $response.Content -ForegroundColor Green } catch { Write-Host '✗ Backend Health Check Failed: ' $_.Exception.Message -ForegroundColor Red }"

echo.
echo Testing Frontend...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost/' -TimeoutSec 10; Write-Host '✓ Frontend accessible (Status: ' $response.StatusCode ')' -ForegroundColor Green } catch { Write-Host '✗ Frontend not accessible: ' $_.Exception.Message -ForegroundColor Red }"

echo.
echo ===================================================================
echo Port Status Check
echo ===================================================================
echo.

echo Checking port 3306 (MySQL)...
netstat -an | findstr ":3306" >nul
if %ERRORLEVEL% equ 0 (
    echo ✓ Port 3306 is listening
) else (
    echo ✗ Port 3306 is not listening
)

echo Checking port 8080 (Backend)...
netstat -an | findstr ":8080" >nul
if %ERRORLEVEL% equ 0 (
    echo ✓ Port 8080 is listening
) else (
    echo ✗ Port 8080 is not listening
)

echo Checking port 80 (Frontend)...
netstat -an | findstr ":80" >nul
if %ERRORLEVEL% equ 0 (
    echo ✓ Port 80 is listening
) else (
    echo ✗ Port 80 is not listening
)

echo.
echo ===================================================================
echo System Information
echo ===================================================================
echo.

echo Current Date/Time: %date% %time%
echo Computer Name: %COMPUTERNAME%
echo User: %USERNAME%

echo.
echo Java Version:
java -version 2>&1 | findstr "version"

echo.
echo Node.js Version:
node --version 2>nul || echo Node.js not found in PATH

echo.
echo MySQL Version:
mysql --version 2>nul || echo MySQL client not found in PATH

echo.
echo ===================================================================
echo Service URLs
echo ===================================================================
echo Frontend: http://%COMPUTERNAME%/ or http://localhost/
echo Backend:  http://%COMPUTERNAME%:8080/ or http://localhost:8080/
echo Health:   http://%COMPUTERNAME%:8080/actuator/health
echo.

pause
