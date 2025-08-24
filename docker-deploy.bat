@echo off
REM VimaDimension Docker Deployment Script for Windows Server 2016
REM Run this script as Administrator

echo 🚀 Starting VimaDimension Docker Deployment...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: Docker is not running or not accessible
    echo Please ensure Docker Desktop is running on Windows Server 2016
    echo Run as Administrator if needed
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: Docker Compose is not available
    echo Please install Docker Compose or ensure it's included with Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker environment check passed
echo.

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down --remove-orphans

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🏥 Checking service health...

REM Check MySQL
docker-compose exec mysql mysqladmin ping -h localhost --silent >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ MySQL is healthy
) else (
    echo ❌ MySQL health check failed
)

REM Check Backend (using PowerShell for curl equivalent)
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8080/actuator/health' -UseBasicParsing | Out-Null; Write-Host '✅ Backend is healthy' } catch { Write-Host '❌ Backend health check failed' }"

REM Check Frontend
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost/health' -UseBasicParsing | Out-Null; Write-Host '✅ Frontend is healthy' } catch { Write-Host '❌ Frontend health check failed' }"

echo.
echo 🎉 Deployment completed!
echo.
echo 📱 Access your application:
echo    Frontend: http://localhost (or your server IP)
echo    Backend API: http://localhost:8080
echo    Database: localhost:3306
echo.
echo 🔧 Useful commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo    Update services: docker-compose pull ^&^& docker-compose up -d
echo.
echo 📊 Monitor services:
echo    docker-compose ps
echo    docker stats
echo.
pause
