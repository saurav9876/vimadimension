@echo off
REM Convenience launcher for install-windows2016.ps1
PowerShell -ExecutionPolicy Bypass -NoProfile -File "%~dp0install-windows2016.ps1" %*
