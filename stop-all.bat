@echo off
rem stop-all.bat - Ferma frontend (Vite) e backend (Node) su Windows
rem Uso: doppio clic o esegui da PowerShell/CMD nella root del progetto

setlocal
echo Stopping frontend and backend processes for this project...

rem Lista di porte comuni usate dal frontend/backend (modifica se necessario)
set PORTS=5173 3000 3001 5000 5001 8080 4200

for %%P in (%PORTS%) do (
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%%P " ^| findstr LISTENING') do (
    echo Found PID %%A listening on port %%P
    taskkill /PID %%A /F >nul 2>&1 && echo Killed PID %%A || echo Failed to kill PID %%A
  )
)

rem Fallback: se restano processi Node, li terminiamo tutti
tasklist /FI "IMAGENAME eq node.exe" | findstr /I "node.exe" >nul
if %ERRORLEVEL%==0 (
  echo Killing remaining node.exe processes...
  taskkill /F /IM node.exe /T >nul 2>&1 && echo node.exe processes killed || echo Failed to kill node.exe
) else (
  echo No node.exe processes found.
)

echo Done.
endlocal
pause
