@echo off
rem increment-version.bat - Incrementa il numero di versione dell'app MyLyfe Umbria
rem Uso: increment-version.bat [major|minor|patch]
rem Esempi:
rem   increment-version.bat minor   -> da 1.0.0 a 1.1.0
rem   increment-version.bat major   -> da 1.0.0 a 2.0.0
rem   increment-version.bat patch   -> da 1.0.0 a 1.0.1
rem   increment-version.bat         -> incrementa minor per default

setlocal

rem Parametro: major, minor o patch (default: minor)
set INCREMENT_TYPE=%1
if "%INCREMENT_TYPE%"=="" set INCREMENT_TYPE=minor

echo ========================================
echo   MyLyfe Umbria - Version Increment
echo ========================================
echo.
echo Incrementing %INCREMENT_TYPE% version...
echo.

rem Esegui script PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\increment-version.ps1" -incrementType "%INCREMENT_TYPE%"

if %ERRORLEVEL% neq 0 (
  echo.
  echo ERROR: Incremento versione fallito!
  pause
  exit /b 1
)

echo.
echo ========================================
pause
