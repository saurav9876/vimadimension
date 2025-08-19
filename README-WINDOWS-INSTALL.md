# VimaDimension - Windows Server 2016 Installation Guide

This guide provides step-by-step instructions to install and run the VimaDimension project tracking application on Windows Server 2016.

## Table of Contents
1. [Prerequisites Installation](#prerequisites-installation)
2. [Database Setup](#database-setup)
3. [Application Installation](#application-installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Windows Service Setup (Optional)](#windows-service-setup-optional)

## Prerequisites Installation

### 1. Install Java Development Kit (JDK)

**Download and Install OpenJDK 21:**

1. Go to [Microsoft Build of OpenJDK](https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-21)
2. Download `microsoft-jdk-21.x.x-windows-x64.msi`
3. Run the installer as Administrator
4. Follow the installation wizard (use default settings)

**Verify Java Installation:**
```cmd
java -version
javac -version
```

**Set JAVA_HOME (if needed):**
1. Open System Properties → Advanced → Environment Variables
2. Add new System Variable:
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Microsoft\jdk-21.x.x-hotspot`
3. Edit PATH variable and add: `%JAVA_HOME%\bin`

### 2. Install MySQL Server

**Download MySQL:**
1. Go to [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
2. Download MySQL Installer for Windows
3. Choose "mysql-installer-community-8.x.x.x.msi"

**Install MySQL:**
1. Run the installer as Administrator
2. Choose "Server only" installation
3. Select "Standalone MySQL Server"
4. Configuration:
   - Config Type: Development Machine
   - Connectivity: TCP/IP, Port 3306
   - Authentication Method: Use Strong Password Encryption
   - Set root password: `admin@007`
5. Complete the installation

**Start MySQL Service:**
```cmd
net start MySQL80
```

**Verify MySQL Installation:**
```cmd
mysql -u root -p
```
(Enter password: `admin@007`)

### 3. Install Git (Optional)

1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer
3. Use default settings during installation

## Database Setup

**Create Database and User:**

1. Open Command Prompt as Administrator
2. Connect to MySQL:
```cmd
mysql -u root -p
```
3. Enter password: `admin@007`
4. Run these SQL commands:
```sql
CREATE DATABASE project_tracker_db;
CREATE USER 'tracker_app_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON project_tracker_db.* TO 'tracker_app_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Application Installation

### Method 1: Download from GitHub (Recommended)

1. Create application directory:
```cmd
mkdir C:\VimaDimension
cd C:\VimaDimension
```

2. Download the application:
   - Go to the GitHub repository
   - Click "Code" → "Download ZIP"
   - Extract to `C:\VimaDimension`

### Method 2: Using Git

```cmd
cd C:\
git clone <repository-url> VimaDimension
cd VimaDimension
```

## Configuration

**Configure Database Connection:**

1. Navigate to the application directory:
```cmd
cd C:\VimaDimension\vimadimension-main
```

2. Edit the configuration file:
```cmd
notepad src\main\resources\application.properties
```

3. Verify these settings are correct:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/project_tracker_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=tracker_app_user
spring.datasource.password=your_strong_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

## Running the Application

### Quick Start

1. Open Command Prompt as Administrator
2. Navigate to application directory:
```cmd
cd C:\VimaDimension\vimadimension-main
```

3. Run the startup script:
```cmd
start-app.bat
```

### Manual Start

If the script doesn't work, use this manual approach:

```cmd
cd C:\VimaDimension\vimadimension-main
gradlew.bat bootRun
```

### Verify Application is Running

1. Open a web browser
2. Go to: `http://localhost:8080`
3. You should see a login page

## Troubleshooting

### Common Issues

**Issue: "Java is not recognized"**
- Solution: Ensure Java is installed and JAVA_HOME is set correctly

**Issue: "MySQL connection refused"**
- Solution: Verify MySQL service is running: `net start MySQL80`

**Issue: "Access denied for user"**
- Solution: Verify database user and password are created correctly

**Issue: "Port 8080 already in use"**
- Solution: Kill processes using port 8080:
```cmd
netstat -ano | findstr :8080
taskkill /PID <process_id> /F
```

**Issue: "gradlew.bat not found"**
- Solution: Ensure you're in the correct directory with the gradlew.bat file

### Firewall Configuration

If accessing from other machines:

1. Open Windows Firewall with Advanced Security
2. Create new Inbound Rule:
   - Rule Type: Port
   - Protocol: TCP
   - Port: 8080
   - Action: Allow the connection
   - Profile: Apply to all
   - Name: VimaDimension Application

### View Application Logs

Logs are displayed in the Command Prompt window. For persistent logs:

1. Redirect output to file:
```cmd
gradlew.bat bootRun > application.log 2>&1
```

## Windows Service Setup (Optional)

To run the application as a Windows Service:

### 1. Install NSSM (Non-Sucking Service Manager)

1. Download NSSM from [nssm.cc](https://nssm.cc/download)
2. Extract to `C:\nssm`
3. Add `C:\nssm\win64` to PATH

### 2. Create the Service

```cmd
nssm install VimaDimension
```

Configure the service:
- Path: `C:\VimaDimension\vimadimension-main\gradlew.bat`
- Arguments: `bootRun`
- Startup directory: `C:\VimaDimension\vimadimension-main`

### 3. Start the Service

```cmd
net start VimaDimension
```

## System Requirements

- **OS:** Windows Server 2016 or later
- **RAM:** Minimum 2GB, Recommended 4GB+
- **Disk:** 1GB free space
- **Java:** OpenJDK 17 or higher
- **MySQL:** 8.0 or higher
- **Network:** Port 8080 available

## Default Credentials

The application will create default admin credentials on first run. Check the application logs for details.

## Support

For technical support:
- Check application logs for error details
- Verify all prerequisites are properly installed
- Ensure firewall rules allow port 8080
- Confirm MySQL service is running

## Application URLs

Once running:
- **Main Application:** http://localhost:8080
- **Login Page:** http://localhost:8080/login
- **Registration:** http://localhost:8080/register

---

*This installation guide was created for VimaDimension project tracking application on Windows Server 2016.*
