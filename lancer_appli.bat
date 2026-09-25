@echo off
title VTC Pro Console
echo ========================================================
echo   Lancement de VTC Pro Console (Mode Local & Developpement)
echo ========================================================
echo.
echo URL de l'application : http://localhost:5173/
echo.
start http://localhost:5173/
npm.cmd run dev
pause
