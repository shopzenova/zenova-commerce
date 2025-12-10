@echo off
REM Avvio silenzioso del backend Zenova
REM Questo script avvia il server in background senza aprire finestre

cd /d "C:\Users\giorg\zenova-ecommerce\backend"

REM Verifica se Node.js è già in esecuzione sulla porta 3000
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo Server Zenova gia' in esecuzione
    exit /b
)

REM Avvia il server in modalità minimizzata (mantiene la finestra aperta)
start /min "Zenova Backend" cmd /k "node server.js"

REM Aspetta 3 secondi per dare tempo al server di avviarsi
timeout /t 3 /nobreak > nul

echo Server Zenova avviato in background sulla porta 3000
