@echo off
echo ========================================
echo    ZENOVA E-COMMERCE
echo    Avvio in corso...
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/2] Avvio backend su porta 3000...
start "Zenova Backend" cmd /k "node server.js"

echo [2/2] Attendo 3 secondi...
timeout /t 3 /nobreak >nul

echo [3/3] Apertura browser...
start http://localhost:3000

echo.
echo ========================================
echo    ZENOVA E-COMMERCE ATTIVO!
echo ========================================
echo.
echo Il sito si aprira automaticamente nel browser.
echo Per fermare il backend, chiudi la finestra "Zenova Backend".
echo.
pause
