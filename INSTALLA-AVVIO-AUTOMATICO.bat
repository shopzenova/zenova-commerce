@echo off
title Zenova - Installazione Avvio Automatico
color 0A

echo ========================================
echo    ZENOVA - Avvio Automatico
echo    Configurazione in corso...
echo ========================================
echo.

REM Percorso della cartella Esecuzione automatica
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo [1/3] Verifico cartella Esecuzione automatica...
if not exist "%STARTUP_FOLDER%" (
    echo ❌ Cartella non trovata!
    echo Percorso: %STARTUP_FOLDER%
    pause
    exit /b 1
)
echo ✅ Cartella trovata!

echo.
echo [2/3] Creo collegamento a Zenova Backend...

REM Crea lo script VBS per creare il collegamento
set VBS_SCRIPT=%TEMP%\create_shortcut.vbs
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo sLinkFile = "%STARTUP_FOLDER%\Zenova Backend.lnk" >> "%VBS_SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_SCRIPT%"
echo oLink.TargetPath = "%~dp0AVVIA-BACKEND-SILENZIOSO.bat" >> "%VBS_SCRIPT%"
echo oLink.WorkingDirectory = "%~dp0" >> "%VBS_SCRIPT%"
echo oLink.Description = "Avvia automaticamente il server Zenova" >> "%VBS_SCRIPT%"
echo oLink.WindowStyle = 7 >> "%VBS_SCRIPT%"
echo oLink.Save >> "%VBS_SCRIPT%"

REM Esegui lo script VBS
cscript //nologo "%VBS_SCRIPT%"

if %errorlevel% equ 0 (
    echo ✅ Collegamento creato!
) else (
    echo ❌ Errore creazione collegamento
    pause
    exit /b 1
)

REM Pulisci il file temporaneo
del "%VBS_SCRIPT%"

echo.
echo [3/3] Verifica installazione...
if exist "%STARTUP_FOLDER%\Zenova Backend.lnk" (
    echo ✅ Installazione completata con successo!
) else (
    echo ❌ Collegamento non trovato
    pause
    exit /b 1
)

echo.
echo ========================================
echo    CONFIGURAZIONE COMPLETATA! ✅
echo ========================================
echo.
echo Da ora in poi, quando accedi a Windows:
echo.
echo 1. Il server Zenova si avviera' automaticamente
echo 2. Potrai usare i preferiti: http://localhost:3000
echo 3. I prodotti saranno sempre visibili!
echo.
echo ========================================
echo.
echo Vuoi avviare il server adesso? (S/N)
set /p AVVIA="Risposta: "

if /i "%AVVIA%"=="S" (
    echo.
    echo Avvio server...
    call "%~dp0AVVIA-BACKEND-SILENZIOSO.bat"
    timeout /t 3 /nobreak > nul
    echo.
    echo ✅ Server avviato!
    echo.
    echo Apro Zenova nel browser...
    start http://localhost:3000
)

echo.
echo Premi un tasto per uscire...
pause > nul
exit
