@echo off
title Zenova - Avvio Automatico
color 0A

echo ========================================
echo    ZENOVA - E-commerce Zen & Naturale
echo    Avvio automatico progetto...
echo ========================================
echo.

echo [1/3] Avvio Backend Server...
start "Zenova Backend" cmd /k "cd /d C:\Users\giorg\zenova-ecommerce\backend && npm start"

echo [2/3] Attendo avvio server (8 secondi)...
timeout /t 8 /nobreak >nul

echo [3/3] Apro Zenova nel browser...
start "" "C:\Users\giorg\zenova-ecommerce\index.html"

echo.
echo ========================================
echo    ZENOVA AVVIATO CON SUCCESSO!
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: Aperto nel browser
echo.
echo Per chiudere il backend, vai nella finestra
echo "Zenova Backend" e premi CTRL+C
echo.
echo Questa finestra si chiudera' tra 5 secondi...
timeout /t 5 /nobreak >nul
exit
