@echo off
REM VimaDimension Application Startup Script
REM This script starts the VimaDimension Spring Boot application

echo Starting VimaDimension Application...
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17 or higher and add it to your PATH
    pause
    exit /b 1
)

REM Check if gradlew.bat exists
if not exist "gradlew.bat" (
    echo ERROR: gradlew.bat not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

REM Set the window title
title VimaDimension Application Server

REM Start the application
echo Building and starting the application...
echo This may take a few minutes on first run...
echo.

gradlew.bat bootRun

echo.
echo Application has stopped.
pause
