@echo off
title Apri Zenova
color 0A

echo ========================================
echo    ZENOVA - Apertura Rapida
echo ========================================
echo.

REM Verifica se il server è attivo
echo [1/2] Verifico se il server e' attivo...
netstat -ano | findstr :3000 > nul

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Server non attivo! Avvio il backend...
    echo.
    call "C:\Users\giorg\zenova-ecommerce\AVVIA-BACKEND-SILENZIOSO.bat"
    timeout /t 5 /nobreak > nul
) else (
    echo ✅ Server gia' attivo!
)

echo.
echo [2/2] Apro Zenova nel browser...
start http://localhost:3000

echo.
echo ========================================
echo    ZENOVA APERTO!
echo ========================================
echo.
echo URL: http://localhost:3000
echo.
timeout /t 3 /nobreak > nul
exit
