# VimaDimension Deployment Guide

## 🖥️ Development Environment (MacBook Air)

### Prerequisites
- Docker Desktop for Mac
- Git

### Quick Start
```bash
# Clone and setup
git clone <your-repo>
cd vimadimension

# Start development environment
docker-compose up -d

# Access application
# Frontend: http://localhost
# Backend: http://localhost:8080
# Database: localhost:3306
```

### Development Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

## 🖥️ Production Environment (Windows Server 2016)

### Prerequisites
- Windows Server 2016
- Docker Desktop for Windows
- Static IP address

### Deployment Steps

1. **Copy deployment files to Windows Server**
2. **Run as Administrator:**
   ```cmd
   cd deployment\windows
   configure-firewall.bat
   deploy-windows-server.bat
   ```

3. **Install as Windows Service (Optional):**
   ```cmd
   install-windows-service.bat
   ```

### Production Configuration
- Uses `deployment/production/docker-compose.prod.yml`
- Production Spring profiles
- Persistent volumes
- Restart policies
- Network isolation

### Production Commands
```cmd
# Deploy
deploy-windows-server.bat

# View status
docker-compose -f deployment/production/docker-compose.prod.yml ps

# View logs
docker-compose -f deployment/production/docker-compose.prod.yml logs -f

# Stop
docker-compose -f deployment/production/docker-compose.prod.yml down
```

## 🔧 Environment Differences

| Feature | Development | Production |
|---------|-------------|------------|
| Ports | 80, 8080, 3306 | 80, 8080, 3306 |
| Database | Local volume | Persistent volume |
| Restart | Manual | Auto-restart |
| Logs | Console | Volume mounted |
| Security | Basic | Firewall + isolation |

## 📁 File Structure
```
deployment/
├── README.md                    # This file
├── windows/                     # Windows Server scripts
│   ├── deploy-windows-server.bat
│   ├── configure-firewall.bat
│   └── install-windows-service.bat
└── production/                  # Production config
    └── docker-compose.prod.yml
```
