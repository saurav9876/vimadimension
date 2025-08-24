@echo off
REM VimaDimension Windows Server Deployment Script
REM This script deploys VimaDimension using Docker on Windows Server 2016

echo ========================================
echo VimaDimension Windows Server Deployment
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop for Windows Server first
    pause
    exit /b 1
)

REM Check if Docker is running
docker ps >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker daemon is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo Docker is running. Starting deployment...
echo.

REM Stop any existing containers
echo Stopping existing containers...
docker-compose -f docker-compose.prod.yml down

REM Build and start the application
echo Building and starting VimaDimension...
docker-compose -f docker-compose.prod.yml up --build -d

REM Wait a moment for containers to start
timeout /t 10 /nobreak >nul

REM Check container status
echo.
echo Checking container status...
docker-compose -f docker-compose.prod.yml ps

REM Check if containers are running
docker-compose -f docker-compose.prod.yml ps | find "Up" >nul
if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo DEPLOYMENT SUCCESSFUL!
    echo ========================================
    echo.
    echo VimaDimension is now running at:
    echo - Application: http://localhost:8080
    echo - Database: localhost:3306
    echo.
    echo To access from external networks:
    echo - Use your static IP: http://YOUR_STATIC_IP:8080
    echo.
    echo Useful commands:
    echo - View logs: docker-compose -f docker-compose.prod.yml logs -f
    echo - Stop: docker-compose -f docker-compose.prod.yml down
    echo - Restart: docker-compose -f docker-compose.prod.yml restart
) else (
    echo.
    echo ERROR: Deployment failed. Check logs:
    echo docker-compose -f docker-compose.prod.yml logs
)

echo.
pause
