@echo off
title ZENOVA - Admin Railway (LIVE)
color 0B

echo.
echo ========================================
echo   ZENOVA Admin - Railway LIVE
echo ========================================
echo.
echo Apertura admin aggiornato su Railway...
echo.
echo VANTAGGI:
echo  - Sempre aggiornato (ultimo deploy)
echo  - Collegato a database LIVE
echo  - Modifiche visibili subito online
echo  - Non serve avviare nulla sul PC
echo.

start https://zenova-commerce-production.up.railway.app/admin.html

echo.
echo ========================================
echo   ADMIN APERTO NEL BROWSER!
echo ========================================
echo.
echo URL: https://zenova-commerce-production.up.railway.app/admin.html
echo.
echo Puoi chiudere questa finestra.
echo.
timeout /t 3 /nobreak >nul
exit
