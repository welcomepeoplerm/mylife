@echo off
title MyLyfe Umbria - Dev Start
color 0A

echo.
echo  =======================================
echo   MyLyfe Umbria - Avvio ambiente locale
echo  =======================================
echo.

:: 1. Build FE
echo  [1/3] Build Frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo  ERRORE nella build! Controlla i log sopra.
  pause
  exit /b 1
)

echo.
echo  [2/3] Avvio Backend (Firebase Functions emulator)...
start "MyLyfe - Backend" cmd /k "cd /d %~dp0 && npx firebase emulators:start --only functions"

:: Attendi che il backend si avvii
timeout /t 4 /nobreak > nul

echo  [3/3] Avvio Frontend (Vite Preview)...
start "MyLyfe - Frontend" cmd /k "cd /d %~dp0 && npx vite preview"

:: Attendi che il server sia pronto
timeout /t 2 /nobreak > nul

echo.
echo  =======================================
echo   Servizi avviati:
echo   FE  ^>  http://localhost:4173
echo   BE  ^>  http://localhost:5001
echo  =======================================
echo.
echo  Apertura browser...
start http://localhost:4173

echo.
echo  Chiudi questa finestra per terminare.
echo  Per fermare i server chiudi le finestre "Backend" e "Frontend".
echo.
pause
