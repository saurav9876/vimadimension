#!/bin/bash

# VimaDimension Application Startup Script
# This script starts the VimaDimension Spring Boot application

echo "Starting VimaDimension Application..."
echo

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    echo "Please install Java 17 or higher and add it to your PATH"
    exit 1
fi

# Check if gradlew exists
if [ ! -f "gradlew" ]; then
    echo "ERROR: gradlew not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Make gradlew executable
chmod +x gradlew

echo "Building and starting the application..."
echo "This may take a few minutes on first run..."
echo

# Start the application
./gradlew bootRun

echo
echo "Application has stopped."
