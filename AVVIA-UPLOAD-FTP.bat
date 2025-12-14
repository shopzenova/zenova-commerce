@echo off
echo.
echo ========================================
echo ZENOVA - Upload FTP Automatico
echo ========================================
echo.
echo Avvio script PowerShell...
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0upload-ftp.ps1"
pause
