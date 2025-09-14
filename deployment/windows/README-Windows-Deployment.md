# VimaDimension - Windows Server 2016 Deployment Guide

This guide explains how to deploy VimaDimension on Windows Server 2016 without keeping terminal windows open. All components will run as Windows services.

## 📋 Prerequisites

### Required Software
1. **Windows Server 2016** (or later)
2. **Java JDK 11 or higher** - [Download OpenJDK](https://adoptium.net/)
3. **MySQL Server 8.0** - [Download MySQL](https://dev.mysql.com/downloads/mysql/)
4. **Node.js 18.x LTS** - [Download Node.js](https://nodejs.org/)
5. **IIS (Internet Information Services)** - Enable via Windows Features

### Administrator Privileges
- All installation and service management commands require **Administrator privileges**
- Right-click on Command Prompt and select "Run as administrator"

## 🚀 Deployment Process

### Step 1: Prepare the Application

1. **Copy Project to Server**
   ```
   Copy the entire vimadimension folder to your Windows server
   Example: C:\vimadimension\
   ```

2. **Copy JAR File from Mac**
   ```
   Build the JAR on your Mac: ./gradlew bootJar
   Copy build/libs/vimadimension-1.0-SNAPSHOT.jar to the server
   Place it in: C:\vimadimension\build\libs\
   ```

3. **Build Frontend (Optional - if not pre-built)**
   ```
   cd C:\vimadimension\frontend
   npm install
   npm run build
   ```

### Step 2: Configure Database

1. **Install MySQL Server 8.0**
   - Download and install MySQL Server
   - Remember the root password
   - Ensure MySQL is running on port 3306

2. **Create Database and User**
   ```sql
   -- Connect to MySQL as root
   mysql -u root -p

   -- Create database
   CREATE DATABASE project_tracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   -- Create application user
   CREATE USER 'tracker_app_user'@'localhost' IDENTIFIED BY 'your_secure_production_password';
   GRANT ALL PRIVILEGES ON project_tracker_db.* TO 'tracker_app_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Update Database Configuration**
   - Edit `deployment/windows/install-services.bat`
   - Update the database password in the environment variables section

### Step 3: Install as Windows Services

1. **Run Installation Script**
   ```batch
   cd C:\vimadimension\deployment\windows
   install-services.bat
   ```

   This script will:
   - Download NSSM (Non-Sucking Service Manager)
   - Install MySQL as a Windows service
   - Install Backend as a Windows service
   - Configure IIS for the React frontend
   - Open required firewall ports
   - Start all services

## 🎛️ Service Management

### Start All Services
```batch
cd C:\vimadimension\deployment\windows
start-services.bat
```

### Stop All Services
```batch
cd C:\vimadimension\deployment\windows
stop-services.bat
```

### Uninstall All Services
```batch
cd C:\vimadimension\deployment\windows
uninstall-services.bat
```

### Manual Service Management
```batch
# Using Windows Services Manager
services.msc

# Using Command Line
net start VimaDimensionMySQL
net start VimaDimensionBackend
net start w3svc

net stop VimaDimensionBackend
net stop VimaDimensionMySQL
net stop w3svc
```

## 🌐 Access URLs

After successful installation:

- **Frontend (React)**: `http://your-server-ip/` or `http://localhost/`
- **Backend API**: `http://your-server-ip:8080/` or `http://localhost:8080/`
- **Health Check**: `http://your-server-ip:8080/actuator/health`

## 🔧 Configuration Files

### Backend Configuration
- **Production Profile**: `src/main/resources/application-prod.properties`
- **Environment Variables**: Set via NSSM in the install script

### Frontend Configuration
- **IIS Configuration**: `deployment/windows/web.config`
- **Build Output**: `frontend/build/`

### MySQL Configuration
- **Service Configuration**: `deployment/windows/mysql.ini`
- **Data Directory**: `mysql/data/`

## 🔍 Troubleshooting

### Service Won't Start

1. **Check Service Status**
   ```batch
   sc query VimaDimensionBackend
   sc query VimaDimensionMySQL
   ```

2. **Check Event Logs**
   - Open Event Viewer (eventvwr.msc)
   - Navigate to Windows Logs > Application
   - Look for VimaDimension service errors

3. **Check Service Configuration**
   ```batch
   # View service configuration
   nssm.exe dump VimaDimensionBackend
   nssm.exe dump VimaDimensionMySQL
   ```

### Common Issues

1. **Java Not Found**
   - Ensure Java is installed and in PATH
   - Set JAVA_HOME environment variable

2. **MySQL Connection Failed**
   - Verify MySQL service is running
   - Check database credentials
   - Ensure port 3306 is accessible

3. **Frontend Not Loading**
   - Check if IIS is running: `net start w3svc`
   - Verify frontend build exists in `frontend/build/`
   - Check IIS site configuration

4. **Port Conflicts**
   - Default ports: 80 (Frontend), 8080 (Backend), 3306 (MySQL)
   - Change ports in configuration if needed

### Log Files

- **Backend Logs**: Check Windows Event Viewer or service stdout
- **MySQL Logs**: `mysql/data/error.log`
- **IIS Logs**: `C:\inetpub\logs\LogFiles\`

## 🔄 Updates and Maintenance

### Updating the Application

1. **Stop Services**
   ```batch
   stop-services.bat
   ```

2. **Replace JAR File**
   - Copy new JAR from Mac to `build/libs/`

3. **Update Frontend (if needed)**
   ```batch
   cd frontend
   npm run build
   ```

4. **Start Services**
   ```batch
   start-services.bat
   ```

### Database Backup

```batch
# Backup
mysqldump -u tracker_app_user -p project_tracker_db > backup.sql

# Restore
mysql -u tracker_app_user -p project_tracker_db < backup.sql
```

## 🛡️ Security Considerations

1. **Change Default Passwords**
   - Update MySQL user password
   - Update application.properties accordingly

2. **Firewall Configuration**
   - Only open necessary ports (80, 8080, 3306)
   - Consider restricting access to specific IP ranges

3. **SSL/HTTPS**
   - Configure SSL certificate in IIS for HTTPS
   - Update backend to use HTTPS if needed

4. **Regular Updates**
   - Keep Java, MySQL, and Windows updated
   - Monitor security advisories

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Windows Event Logs
3. Verify all prerequisites are installed
4. Ensure all configuration files have correct paths and credentials

## 🎯 Benefits of This Deployment

✅ **No Terminal Windows**: All services run in the background
✅ **Auto-Start**: Services start automatically on system boot
✅ **Service Management**: Easy start/stop/restart via Windows Services
✅ **Production Ready**: Proper logging, error handling, and monitoring
✅ **Scalable**: Can be easily moved to multiple servers
✅ **Maintainable**: Clear separation of concerns and configuration
