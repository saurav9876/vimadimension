#!/bin/bash

# VimaDimension Docker Deployment Script
# For Windows Server 2016 with Docker Desktop

echo "🚀 Starting VimaDimension Docker Deployment..."
echo

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ ERROR: Docker is not running or not accessible"
    echo "Please ensure Docker Desktop is running on Windows Server 2016"
    exit 1
fi

# Check if Docker Compose is available
if ! docker-compose --version > /dev/null 2>&1; then
    echo "❌ ERROR: Docker Compose is not available"
    echo "Please install Docker Compose or ensure it's included with Docker Desktop"
    exit 1
fi

echo "✅ Docker environment check passed"
echo

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Remove old images (optional - uncomment if you want to force rebuild)
# echo "🧹 Removing old images..."
# docker-compose down --rmi all --volumes --remove-orphans

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check MySQL
if docker-compose exec mysql mysqladmin ping -h localhost --silent; then
    echo "✅ MySQL is healthy"
else
    echo "❌ MySQL health check failed"
fi

# Check Backend
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check Frontend
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

echo
echo "🎉 Deployment completed!"
echo
echo "📱 Access your application:"
echo "   Frontend: http://localhost (or your server IP)"
echo "   Backend API: http://localhost:8080"
echo "   Database: localhost:3306"
echo
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update services: docker-compose pull && docker-compose up -d"
echo
echo "📊 Monitor services:"
echo "   docker-compose ps"
echo "   docker stats"
