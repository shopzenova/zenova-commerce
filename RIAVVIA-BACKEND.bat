@echo off
REM Riavvia il backend Zenova killando il processo esistente

echo Ricerca processo Node.js sulla porta 3000...

REM Trova il PID sulla porta 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Trovato processo PID: %%a
    echo Termino il processo...
    taskkill /F /PID %%a /T >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo Avvio nuovo backend...
cd /d "C:\Users\giorg\zenova-ecommerce\backend"
start /min "Zenova Backend" cmd /k "node server.js"

timeout /t 3 /nobreak >nul
echo.
echo Backend riavviato!
echo.
