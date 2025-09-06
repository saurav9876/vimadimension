<#
One-click installer for Windows Server 2016 (no Docker).

What it does:
- Ensures Admin + TLS 1.2
- Installs JDK 21 (Temurin) if missing
- Installs Node.js 18 LTS if missing
- Builds backend (Gradle) and installs as Windows service via NSSM
- Enables IIS and serves React build on port 80
- Opens firewall ports (80, 8080, 3306)

Usage (run as Administrator):
  PowerShell -ExecutionPolicy Bypass -File deployment\install-windows2016.ps1 -DbPassword "<pass>"

Params let you set DB and ports. If MySQL isn’t installed, the app will still start but fail to connect until DB is ready.
#>

param(
  [string]$DbHost = "localhost",
  [int]$DbPort = 3306,
  [string]$DbName = "project_tracker_db",
  [string]$DbUser = "tracker_app_user",
  [string]$DbPassword = "your_secure_production_password",
  [int]$AppPort = 8080,
  [string]$ServiceName = "VimaDimension",
  [switch]$SkipBackendBuild,
  [string]$JarPath,
  [switch]$SkipJdkInstall,
  [switch]$SkipNodeInstall,
  [switch]$SkipIisConfig,
  [switch]$SkipNssmDownload
)

function Ensure-Admin {
  if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Run this script as Administrator."; exit 1
  }
}

function Ensure-Tls12 { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 }

function ExecOrDie([string]$cmd, [string]$err) {
  Write-Host $cmd -ForegroundColor DarkGray
  $LASTEXITCODE = 0
  cmd.exe /c $cmd
  if ($LASTEXITCODE -ne 0) { Write-Error $err; exit 1 }
}

function Have-Cmd([string]$name) { $null -ne (Get-Command $name -ErrorAction SilentlyContinue) }

function Ensure-JDK21 {
  if ($SkipJdkInstall) { return }
  if (Have-Cmd java) {
    try {
      $ver = (& java -version) 2>&1 | Select-Object -First 1
      if ($ver -match 'version "21') { Write-Host "JDK 21 detected."; return }
      else { Write-Host "Java detected ($ver) but not 21. Proceeding to install JDK 21..." -ForegroundColor Yellow }
    } catch {}
  }
  $url = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.2%2B13/OpenJDK21U-jdk_x64_windows_hotspot_21.0.2_13.msi"
  $msi = "$env:TEMP\temurin21.msi"
  Write-Host "Downloading Temurin JDK 21..."
  Invoke-WebRequest -Uri $url -OutFile $msi
  Write-Host "Installing Temurin JDK 21..."
  ExecOrDie "msiexec /i `"$msi`" /qn /norestart" "Failed to install JDK 21"
}

function Ensure-Node18 {
  if ($SkipNodeInstall) { return }
  if (Have-Cmd node) {
    try {
      $ver = (& node -v) 2>&1
      if ($ver -match '^v18\.'){ Write-Host "Node 18 detected."; return }
      else { Write-Host "Node detected ($ver) but not 18.x. Proceeding to install Node 18..." -ForegroundColor Yellow }
    } catch {}
  }
  $url = "https://nodejs.org/dist/v18.20.3/node-v18.20.3-x64.msi"
  $msi = "$env:TEMP\node18.msi"
  Write-Host "Downloading Node.js 18..."
  Invoke-WebRequest -Uri $url -OutFile $msi
  Write-Host "Installing Node.js 18..."
  ExecOrDie "msiexec /i `"$msi`" /qn /norestart" "Failed to install Node 18"
}

function Ensure-IIS {
  if ($SkipIisConfig) { return }
  Import-Module ServerManager
  Write-Host "Enabling IIS (Static Content, Default Doc)..."
  Add-WindowsFeature Web-Server, Web-Common-Http, Web-Static-Content, Web-Http-Errors, Web-Default-Doc | Out-Null
}

function Ensure-NSSM {
  if ($SkipNssmDownload) { return }
  if (Test-Path "$PSScriptRoot\nssm.exe") { return }
  $zipUrl = "https://nssm.cc/release/nssm-2.24.zip"
  $zip = "$env:TEMP\nssm.zip"
  Write-Host "Downloading NSSM..."
  Invoke-WebRequest -Uri $zipUrl -OutFile $zip
  $tmp = Join-Path $env:TEMP (New-Guid)
  New-Item -ItemType Directory -Path $tmp | Out-Null
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [System.IO.Compression.ZipFile]::ExtractToDirectory($zip, $tmp)
  Copy-Item "$tmp\nssm-2.24\win64\nssm.exe" "$PSScriptRoot\nssm.exe" -Force
  Remove-Item $tmp -Recurse -Force
  Remove-Item $zip -Force
}

function Build-Backend {
  $root = Resolve-Path "$PSScriptRoot\.."
  Write-Host "Building backend via Gradle..."
  Push-Location $root
  if (-not (Test-Path .\gradlew.bat)) { Write-Error "gradlew.bat not found; run from repo root."; exit 1 }
  # Attempt 1: avoid daemon and extra JVM args
  & .\gradlew.bat --no-daemon -Dorg.gradle.daemon=false -Dorg.gradle.jvmargs="" clean bootJar
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "Gradle build failed (attempt 1). Retrying with explicit JVM args..."
    & .\gradlew.bat --no-daemon -Dorg.gradle.daemon=false -Dorg.gradle.jvmargs="-Xms256m -Xmx512m -Dfile.encoding=UTF-8" clean bootJar
  }
  if ($LASTEXITCODE -ne 0) { Write-Error "Gradle build failed after two attempts."; exit 1 }
  Pop-Location
}

function Install-Service {
  $root = Resolve-Path "$PSScriptRoot\.."
  if ($JarPath) {
    if (-not (Test-Path $JarPath)) { Write-Error "Specified JarPath not found: $JarPath"; exit 1 }
    $jarPath = (Resolve-Path $JarPath).Path
  } else {
    $jars = Get-ChildItem -Path "$root\build\libs" -Filter *.jar -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if (-not $jars) { Write-Error "No JAR found in build\\libs. Provide -JarPath to use a prebuilt JAR."; exit 1 }
    $jarPath = $jars[0].FullName
  }
  $nssm = "$PSScriptRoot\nssm.exe"
  if (-not (Test-Path $nssm)) { Write-Error "nssm.exe not found"; exit 1 }
  Write-Host "Installing service $ServiceName ..."
  & $nssm install $ServiceName "C:\\Windows\\System32\\cmd.exe" "/c java -jar `"$jarPath`" --spring.profiles.active=prod"
  & $nssm set $ServiceName AppDirectory "$root"
  & $nssm set $ServiceName Start SERVICE_AUTO_START
  & $nssm set $ServiceName Description "VimaDimension Spring Boot Backend"
  $envs = @(
    "SPRING_PROFILES_ACTIVE=prod",
    "SPRING_DATASOURCE_URL=jdbc:mysql://${DbHost}:${DbPort}/${DbName}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
    "SPRING_DATASOURCE_USERNAME=${DbUser}",
    "SPRING_DATASOURCE_PASSWORD=${DbPassword}",
    "SPRING_JPA_HIBERNATE_DDL_AUTO=update",
    "SERVER_PORT=${AppPort}",
    "JAVA_TOOL_OPTIONS=-Xms256m -Xmx512m -Dfile.encoding=UTF-8"
  )
  foreach ($e in $envs) { & $nssm set $ServiceName AppEnvironmentExtra $e }
  Write-Host "Starting service..."
  cmd.exe /c "net stop $ServiceName" | Out-Null
  cmd.exe /c "net start $ServiceName"
}

function Build-Frontend {
  $frontend = Resolve-Path "$PSScriptRoot\..\frontend"
  if (-not (Test-Path "$frontend\package.json")) { Write-Host "frontend folder not found; skipping" -ForegroundColor Yellow; return }
  Write-Host "Building frontend (npm install + build)..."
  Push-Location $frontend
  if (-not (Have-Cmd npm)) { Write-Error "npm not found; install Node 18."; exit 1 }
  npm install
  if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; exit 1 }
  npm run build
  if ($LASTEXITCODE -ne 0) { Write-Error "npm run build failed"; exit 1 }
  Pop-Location
}

function Ensure-WebConfig($buildPath) {
  $webConfig = Join-Path $buildPath "web.config"
  if (Test-Path $webConfig) { return }
  @'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReactRouter" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api/" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".webp" mimeType="image/webp" />
    </staticContent>
  </system.webServer>
</configuration>
'@ | Out-File -FilePath $webConfig -Encoding UTF8 -Force
}

function Configure-IIS {
  if ($SkipIisConfig) { return }
  $buildPath = Resolve-Path "$PSScriptRoot\..\frontend\build"
  if (-not (Test-Path $buildPath)) { Write-Host "frontend build not found; skipping IIS config" -ForegroundColor Yellow; return }
  Ensure-WebConfig $buildPath
  Import-Module WebAdministration
  $site = "VimaFrontend"
  Write-Host "Configuring IIS site '$site' on port 80..."
  if (-not (Test-Path IIS:\AppPools\$site)) { New-Item IIS:\AppPools\$site | Out-Null }
  if (-not (Test-Path IIS:\Sites\$site)) {
    New-Item IIS:\Sites\$site -bindings @{protocol='http';bindingInformation=":80:"} -physicalPath $buildPath | Out-Null
  } else {
    Set-ItemProperty IIS:\Sites\$site -Name physicalPath -Value $buildPath
  }
  Set-ItemProperty IIS:\Sites\$site -Name applicationPool -Value $site
  # Ensure index.html default doc
  $def = (Get-WebConfigurationProperty -Filter /system.webServer/defaultDocument/files -PSPath IIS:\ -Location $site -Name ".").Collection
  if (-not ($def | Where-Object { $_.value -eq 'index.html' })) {
    Add-WebConfigurationProperty -pspath IIS:\ -location $site -filter /system.webServer/defaultDocument/files -name "." -value @{value='index.html'} | Out-Null
  }
}

function Open-Firewall {
  Write-Host "Opening firewall ports 80, $AppPort, 3306..."
  cmd.exe /c "netsh advfirewall firewall add rule name=Vima_HTTP dir=in action=allow protocol=TCP localport=80" | Out-Null
  cmd.exe /c "netsh advfirewall firewall add rule name=Vima_Backend dir=in action=allow protocol=TCP localport=$AppPort" | Out-Null
  cmd.exe /c "netsh advfirewall firewall add rule name=Vima_MySQL dir=in action=allow protocol=TCP localport=3306" | Out-Null
}

# ----------------- Main -----------------
Ensure-Admin
Ensure-Tls12

Write-Host "Installing prerequisites..." -ForegroundColor Cyan
Ensure-JDK21
Ensure-Node18
Ensure-IIS
Ensure-NSSM

Write-Host "Building application..." -ForegroundColor Cyan
# Neutralize problematic JVM args from environment for this session
$badEnv = @('JAVA_TOOL_OPTIONS','_JAVA_OPTIONS','GRADLE_OPTS')
foreach ($k in $badEnv) {
  if (Test-Path "Env:$k") {
    Write-Host "Clearing $k for this session to avoid daemon issues" -ForegroundColor Yellow
    Remove-Item "Env:$k" -ErrorAction SilentlyContinue
  }
}
# Use a short Gradle cache path to avoid Windows MAX_PATH issues
if (-not (Test-Path "C:\\gradle-cache")) { New-Item -ItemType Directory -Path "C:\\gradle-cache" | Out-Null }
$env:GRADLE_USER_HOME = "C:\\gradle-cache"
if (-not $SkipBackendBuild) {
  Build-Backend
} else {
  Write-Host "Skipping backend build as requested (-SkipBackendBuild)." -ForegroundColor Yellow
}
Install-Service
Build-Frontend
Configure-IIS
Open-Firewall

$backendUrl = "http://localhost:$AppPort/actuator/health"
$frontendUrl = "http://localhost/"
Write-Host "Installation complete." -ForegroundColor Green
Write-Host "Backend health: $backendUrl"
Write-Host "Frontend:      $frontendUrl"
