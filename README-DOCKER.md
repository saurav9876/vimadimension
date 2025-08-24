# VimaDimension Docker Deployment Guide

## Overview
This guide covers deploying VimaDimension on Windows Server 2016 using Docker containers. The application is now containerized with Java 23, Spring Boot 3.2.0, React 18, and MySQL 8.0.

## Architecture
- **Frontend**: React 18 with Nginx (Port 80)
- **Backend**: Spring Boot 3.2.0 with Java 23 (Port 8080)
- **Database**: MySQL 8.0 (Port 3306)
- **Reverse Proxy**: Nginx (Optional, for production)

## Prerequisites for Windows Server 2016

### 1. System Requirements
- Windows Server 2016 Standard/Datacenter
- 4GB RAM minimum (8GB+ recommended)
- 20GB+ free disk space
- Static IP address configured
- Internet access for Docker image downloads

### 2. Install Docker Desktop
```powershell
# Download Docker Desktop for Windows Server
# https://docs.docker.com/desktop/install/windows-server/

# Enable Windows Subsystem for Linux 2 (WSL2)
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart server after WSL2 installation
# Install Docker Desktop and restart again
```

### 3. Verify Docker Installation
```powershell
docker --version
docker-compose --version
docker info
```

## Quick Deployment

### Option 1: Automated Deployment (Recommended)
```powershell
# Run as Administrator
.\docker-deploy.bat
```

### Option 2: Manual Deployment
```powershell
# Build and start all services
docker-compose up --build -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

## Configuration

### 1. Environment Variables
Edit `docker-compose.yml` to customize:
- Database passwords
- Port mappings
- Memory limits
- Volume paths

### 2. Database Configuration
```yaml
mysql:
  environment:
    MYSQL_ROOT_PASSWORD: your_secure_root_password
    MYSQL_PASSWORD: your_secure_app_password
```

### 3. Application Properties
- `application-docker.properties`: Docker-specific settings
- `application.properties`: Default configuration
- Environment variables override properties

## Service Management

### Start Services
```powershell
docker-compose up -d
```

### Stop Services
```powershell
docker-compose down
```

### Restart Services
```powershell
docker-compose restart
```

### Update Services
```powershell
docker-compose pull
docker-compose up -d
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

## Monitoring & Health Checks

### Service Status
```powershell
docker-compose ps
docker stats
```

### Health Endpoints
- Frontend: `http://your-server-ip/health`
- Backend: `http://your-server-ip:8080/actuator/health`
- Database: Internal health check

### Log Monitoring
```powershell
# Real-time logs
docker-compose logs -f --tail=100

# Export logs
docker-compose logs > app-logs.txt
```

## Production Deployment

### 1. Enable Production Profile
```yaml
# In docker-compose.yml, uncomment nginx-proxy service
# Use docker-compose --profile production up -d
```

### 2. SSL Configuration
```yaml
# Add SSL certificates to ./nginx/ssl/
# Configure nginx.conf for HTTPS
```

### 3. Backup Strategy
```powershell
# Database backup
docker-compose exec mysql mysqldump -u root -p project_tracker_db > backup.sql

# Volume backup
docker run --rm -v vimadimension_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz -C /data .
```

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
```powershell
# Check what's using ports 80, 8080, 3306
netstat -ano | findstr :80
netstat -ano | findstr :8080
netstat -ano | findstr :3306
```

#### 2. Docker Service Issues
```powershell
# Restart Docker service
Restart-Service docker

# Reset Docker Desktop
# Settings > Troubleshoot > Reset to factory defaults
```

#### 3. Database Connection Issues
```powershell
# Check MySQL container
docker-compose exec mysql mysql -u root -p

# Verify database exists
SHOW DATABASES;
USE project_tracker_db;
SHOW TABLES;
```

#### 4. Memory Issues
```yaml
# Adjust memory limits in docker-compose.yml
backend:
  environment:
    JAVA_OPTS: -Xmx1g -Xms512m
```

### Debug Mode
```powershell
# Enable debug mode
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Access debug port 5005 for backend
```

## Security Considerations

### 1. Change Default Passwords
- Update MySQL passwords in `docker-compose.yml`
- Change Spring Security default credentials
- Use strong, unique passwords

### 2. Network Security
- Configure Windows Firewall rules
- Use internal Docker networks
- Limit external port exposure

### 3. Regular Updates
```powershell
# Update base images
docker-compose pull
docker-compose up -d

# Update application code
git pull origin main
docker-compose up --build -d
```

## Performance Tuning

### 1. JVM Settings
```yaml
backend:
  environment:
    JAVA_OPTS: -Xmx2g -Xms1g -XX:+UseG1GC
```

### 2. Database Optimization
```yaml
mysql:
  environment:
    MYSQL_INNODB_BUFFER_POOL_SIZE: 1G
    MYSQL_INNODB_LOG_FILE_SIZE: 256M
```

### 3. Nginx Configuration
- Enable gzip compression
- Configure caching headers
- Optimize worker processes

## Support & Maintenance

### Regular Tasks
- Monitor disk space usage
- Check container health status
- Review application logs
- Update security patches
- Backup database regularly

### Emergency Procedures
```powershell
# Quick restart
docker-compose restart

# Full restart
docker-compose down && docker-compose up -d

# Rollback to previous version
docker-compose down
docker image tag vimadimension-backend:previous vimadimension-backend:latest
docker-compose up -d
```

## Contact & Resources
- Docker Documentation: https://docs.docker.com/
- Spring Boot Documentation: https://spring.io/projects/spring-boot
- React Documentation: https://reactjs.org/docs/
- MySQL Documentation: https://dev.mysql.com/doc/

---

**Note**: This deployment guide is specifically designed for Windows Server 2016. For other environments, refer to the main README.md file.
