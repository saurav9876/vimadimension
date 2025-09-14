@echo off
REM ===================================================================
REM VimaDimension - Windows Server 2016 Service Installation
REM ===================================================================
REM This script installs MySQL, Backend, and Frontend as Windows services
REM Run as Administrator
REM ===================================================================

echo.
echo ===================================================================
echo VimaDimension - Windows Service Installation
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

REM Set variables
set SERVICE_NAME_BACKEND=VimaDimensionBackend
set SERVICE_NAME_MYSQL=VimaDimensionMySQL
set JAR_PATH=%~dp0..\build\libs\vimadimension-1.0-SNAPSHOT.jar
set MYSQL_DATA_DIR=%~dp0..\mysql\data
set MYSQL_INIT_DIR=%~dp0..\mysql\init
set FRONTEND_BUILD_DIR=%~dp0..\frontend\build
set NSSM_PATH=%~dp0nssm.exe

echo Checking prerequisites...

REM Check if JAR file exists
if not exist "%JAR_PATH%" (
    echo ERROR: JAR file not found at %JAR_PATH%
    echo Please build the project first or copy the JAR file from your Mac
    pause
    exit /b 1
)

REM Check if NSSM exists, if not download it
if not exist "%NSSM_PATH%" (
    echo Downloading NSSM (Non-Sucking Service Manager)...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile '%TEMP%\nssm.zip'; Expand-Archive -Path '%TEMP%\nssm.zip' -DestinationPath '%TEMP%\nssm' -Force; Copy-Item '%TEMP%\nssm\nssm-2.24\win64\nssm.exe' '%~dp0nssm.exe' -Force; Remove-Item '%TEMP%\nssm.zip' -Force; Remove-Item '%TEMP%\nssm' -Recurse -Force}"
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to download NSSM
        pause
        exit /b 1
    )
)

REM Check if MySQL directory exists
if not exist "%MYSQL_DATA_DIR%" (
    echo ERROR: MySQL data directory not found at %MYSQL_DATA_DIR%
    echo Please ensure MySQL is properly set up
    pause
    exit /b 1
)

echo.
echo Installing MySQL Service...
echo ===================================================================

REM Stop existing MySQL service if running
sc query %SERVICE_NAME_MYSQL% >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Stopping existing MySQL service...
    net stop %SERVICE_NAME_MYSQL%
    "%NSSM_PATH%" remove %SERVICE_NAME_MYSQL% confirm
)

REM Install MySQL as Windows service
"%NSSM_PATH%" install %SERVICE_NAME_MYSQL% "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
"%NSSM_PATH%" set %SERVICE_NAME_MYSQL% AppParameters "--defaults-file=%~dp0mysql.ini --datadir=%MYSQL_DATA_DIR%"
"%NSSM_PATH%" set %SERVICE_NAME_MYSQL% AppDirectory "%~dp0"
"%NSSM_PATH%" set %SERVICE_NAME_MYSQL% DisplayName "VimaDimension MySQL Server"
"%NSSM_PATH%" set %SERVICE_NAME_MYSQL% Description "MySQL Server for VimaDimension Application"
"%NSSM_PATH%" set %SERVICE_NAME_MYSQL% Start SERVICE_AUTO_START

echo.
echo Installing Backend Service...
echo ===================================================================

REM Stop existing backend service if running
sc query %SERVICE_NAME_BACKEND% >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Stopping existing backend service...
    net stop %SERVICE_NAME_BACKEND%
    "%NSSM_PATH%" remove %SERVICE_NAME_BACKEND% confirm
)

REM Install Backend as Windows service
"%NSSM_PATH%" install %SERVICE_NAME_BACKEND% "java"
"%NSSM_PATH%" set %SERVICE_NAME_BACKEND% AppParameters "-Xms256m -Xmx1024m -Dspring.profiles.active=prod -jar \"%JAR_PATH%\""
"%NSSM_PATH%" set %SERVICE_NAME_BACKEND% AppDirectory "%~dp0.."
"%NSSM_PATH%" set %SERVICE_NAME_BACKEND% DisplayName "VimaDimension Backend"
"%NSSM_PATH%" set %SERVICE_NAME_BACKEND% Description "Spring Boot Backend for VimaDimension Application"
"%NSSM_PATH%" set %SERVICE_NAME_BACKEND% Start SERVICE_AUTO_START

REM Set environment variables for backend
"%NSSM_PATH%" set %SERVICE_NAME_BACKEND% AppEnvironmentExtra "SPRING_PROFILES_ACTIVE=prod"
"%NSSM_PATH%" set %SERVICE_NAME_BACKEND% AppEnvironmentExtra "SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/project_tracker_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
"%NSSM_PATH%" set %SERVICE_NAME_BACKEND% AppEnvironmentExtra "SPRING_DATASOURCE_USERNAME=tracker_app_user"
"%NSSM_PATH%" set %SERVICE_NAME_BACKEND% AppEnvironmentExtra "SPRING_DATASOURCE_PASSWORD=your_secure_production_password"
"%NSSM_PATH%" set %SERVICE_NAME_BACKEND% AppEnvironmentExtra "SERVER_PORT=8080"

REM Set service dependencies (backend depends on MySQL)
"%NSSM_PATH%" set %SERVICE_NAME_BACKEND% DependOnService %SERVICE_NAME_MYSQL%

echo.
echo Configuring IIS for Frontend...
echo ===================================================================

REM Enable IIS features
powershell -Command "Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirect, IIS-ApplicationDevelopment, IIS-NetFxExtensibility45, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-ManagementConsole, IIS-IIS6ManagementCompatibility, IIS-Metabase, IIS-ASPNET45 -All"

REM Configure IIS site for frontend
if exist "%FRONTEND_BUILD_DIR%" (
    echo Configuring IIS site for React frontend...
    
    REM Import WebAdministration module and create site
    powershell -Command "& {Import-Module WebAdministration; if (Get-Website -Name 'VimaDimensionFrontend' -ErrorAction SilentlyContinue) { Remove-Website -Name 'VimaDimensionFrontend' -Confirm:\$false }; New-Website -Name 'VimaDimensionFrontend' -Port 80 -PhysicalPath '%FRONTEND_BUILD_DIR%'}"
    
    echo Frontend configured to run on port 80
) else (
    echo WARNING: Frontend build directory not found at %FRONTEND_BUILD_DIR%
    echo Please build the frontend first using: npm run build
)

echo.
echo Opening Firewall Ports...
echo ===================================================================

REM Open firewall ports
netsh advfirewall firewall add rule name="VimaDimension-HTTP" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="VimaDimension-Backend" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="VimaDimension-MySQL" dir=in action=allow protocol=TCP localport=3306

echo.
echo Starting Services...
echo ===================================================================

REM Start MySQL service
echo Starting MySQL service...
net start %SERVICE_NAME_MYSQL%
if %ERRORLEVEL% neq 0 (
    echo WARNING: Failed to start MySQL service
    echo Please check MySQL installation and configuration
)

REM Wait a moment for MySQL to start
timeout /t 5 /nobreak >nul

REM Start Backend service
echo Starting Backend service...
net start %SERVICE_NAME_BACKEND%
if %ERRORLEVEL% neq 0 (
    echo WARNING: Failed to start Backend service
    echo Please check Java installation and JAR file
)

REM Start IIS
echo Starting IIS...
net start w3svc
if %ERRORLEVEL% neq 0 (
    echo WARNING: Failed to start IIS
)

echo.
echo ===================================================================
echo Installation Complete!
echo ===================================================================
echo.
echo Services installed:
echo - %SERVICE_NAME_MYSQL% (MySQL Database)
echo - %SERVICE_NAME_BACKEND% (Spring Boot Backend)
echo - IIS Website: VimaDimensionFrontend (React Frontend)
echo.
echo Access URLs:
echo - Frontend: http://localhost/ or http://your-server-ip/
echo - Backend API: http://localhost:8080/ or http://your-server-ip:8080/
echo - Backend Health: http://localhost:8080/actuator/health
echo.
echo All services are configured to start automatically on system boot.
echo.
echo To manage services, use:
echo - start-services.bat (start all services)
echo - stop-services.bat (stop all services)
echo - Windows Services Manager (services.msc)
echo.
pause
