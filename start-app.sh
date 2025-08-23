#!/bin/bash

# VimaDimension Application Startup Script
# This script builds the React frontend and starts both the Spring Boot backend and React development server

echo "Starting VimaDimension Application with React Frontend..."
echo

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    echo "Please install Java 17 or higher and add it to your PATH"
    exit 1
fi

# Check if Node.js is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: Node.js/npm is not installed or not in PATH"
    echo "Please install Node.js and npm to build the React frontend"
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

echo "Building React frontend..."
echo

# Navigate to frontend directory and build React app
if [ -d "frontend" ]; then
    cd frontend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "Installing React dependencies..."
        npm install
    fi
    
    # Build React app for production
    echo "Building React application..."
    npm run build
    
    # Copy build files to Spring Boot static resources
    echo "Copying React build to Spring Boot static resources..."
    cp -r build/* ../src/main/resources/static/
    
    cd ..
else
    echo "WARNING: Frontend directory not found. Skipping React build."
fi

# Function to cleanup background processes on script exit
cleanup() {
    echo "Shutting down services..."
    if [ ! -z "$REACT_PID" ]; then
        echo "Stopping React development server..."
        kill $REACT_PID 2>/dev/null || true
    fi
    if [ ! -z "$SPRING_PID" ]; then
        echo "Stopping Spring Boot application..."
        kill $SPRING_PID 2>/dev/null || true
    fi
    echo "All services stopped."
    exit 0
}

# Set trap to cleanup processes on script exit
trap cleanup SIGINT SIGTERM EXIT

# Kill any existing processes on ports 3000 and 8080
echo "Checking for existing processes on ports 3000 and 8080..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    echo "Stopping existing React development server on port 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null; then
    echo "Stopping existing Spring Boot application on port 8080..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "Starting React development server..."
echo "React UI will be available at: http://localhost:3000"
echo

# Start React development server in background
cd frontend
npm start &
REACT_PID=$!
cd ..

echo "Starting Spring Boot application..."
echo "Backend API will be available at: http://localhost:8080"
echo "This may take a few minutes on first run..."
echo

# Start Spring Boot application in background
./gradlew bootRun &
SPRING_PID=$!

echo "Both services are starting up..."
echo "React UI: http://localhost:3000"
echo "Backend API: http://localhost:8080"
echo
echo "Press Ctrl+C to stop all services"
echo

# Wait for both processes
wait
