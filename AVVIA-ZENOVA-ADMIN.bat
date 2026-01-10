@echo off
title ZENOVA E-Commerce - Admin Panel
color 0A

echo.
echo ========================================
echo   ZENOVA E-Commerce - Avvio Admin
echo ========================================
echo.

REM Vai alla directory zenova-ecommerce
cd /d C:\Users\giorg\zenova-ecommerce

echo [1/3] Avvio backend locale...
start "Zenova Backend" cmd /k "cd backend && npm start"

echo [2/3] Attendo avvio backend (15 secondi)...
timeout /t 15 /nobreak >nul

echo [3/3] Avvio frontend e admin...
start "Zenova Frontend" cmd /k "npx http-server -p 8080"

echo.
echo Attendo avvio server HTTP (5 secondi)...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   APERTURA ADMIN PANEL...
echo ========================================
echo.
start http://127.0.0.1:8080/admin.html

echo.
echo ========================================
echo   ZENOVA ADMIN AVVIATO!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://127.0.0.1:8080
echo Admin:    http://127.0.0.1:8080/admin.html
echo.
echo IMPORTANTE: NON CHIUDERE QUESTA FINESTRA!
echo Per fermare i server, chiudi le finestre del backend e frontend.
echo.
pause
