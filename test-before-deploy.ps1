#!/usr/bin/env pwsh
# Test pre-deploy per MyLyfe Umbria

Write-Host "[TEST] Pre-Deploy MyLyfe Umbria" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifica che siamo nella directory corretta
if (-not (Test-Path "package.json")) {
    Write-Host "[X] Errore: package.json non trovato" -ForegroundColor Red
    Write-Host "Assicurati di essere nella directory del progetto" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Directory progetto trovata" -ForegroundColor Green

# 2. Verifica node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "[!] node_modules non trovato" -ForegroundColor Yellow
    Write-Host "Eseguo npm install..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] npm install fallito" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[OK] Dipendenze trovate" -ForegroundColor Green

# 3. Verifica file critici
$criticalFiles = @(
    "src/firebase-config.js",
    "public/firebase-messaging-sw.js",
    "src/auth-service.js",
    "src/admin-login.js",
    "index.html"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "[OK] $file" -ForegroundColor Green
    } else {
        Write-Host "[X] $file mancante" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "[X] File critici mancanti. Impossibile continuare." -ForegroundColor Red
    exit 1
}

# 4. Test build
Write-Host ""
Write-Host "[BUILD] Eseguo build di test..." -ForegroundColor Cyan
npm run build 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Build fallita" -ForegroundColor Red
    Write-Host "Esegui 'npm run build' per vedere gli errori" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "[OK] Build completata con successo" -ForegroundColor Green
}

# 5. Verifica dist folder
if (Test-Path "dist") {
    $distFiles = Get-ChildItem "dist" -Recurse | Measure-Object
    Write-Host "[OK] Cartella dist creata ($($distFiles.Count) files)" -ForegroundColor Green
} else {
    Write-Host "[X] Cartella dist non trovata dopo build" -ForegroundColor Red
    exit 1
}

# 6. Verifica Service Worker in dist
if (Test-Path "dist/firebase-messaging-sw.js") {
    Write-Host "[OK] Service Worker presente in build" -ForegroundColor Green
} else {
    Write-Host "[!] Service Worker non trovato in dist/" -ForegroundColor Yellow
    Write-Host "Verifica che venga copiato correttamente" -ForegroundColor Yellow
}

# 7. Riepilogo
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "[RIEPILOGO] Test" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "[OK] Directory progetto OK" -ForegroundColor Green
Write-Host "[OK] Dipendenze installate" -ForegroundColor Green
Write-Host "[OK] File critici presenti" -ForegroundColor Green
Write-Host "[OK] Build completata" -ForegroundColor Green
Write-Host ""
Write-Host "[READY] Ready per deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "Comandi deploy disponibili:" -ForegroundColor Cyan
Write-Host "  npm run deploy          # Deploy completo" -ForegroundColor White
Write-Host "  firebase deploy --only hosting  # Solo hosting" -ForegroundColor White
Write-Host ""
Write-Host "Leggi DEPLOY_PRODUCTION_GUIDE.md per la guida completa" -ForegroundColor Yellow
Write-Host ""

# 8. Chiedi se procedere con deploy
$response = Read-Host "Vuoi procedere con il deploy? (s/N)"
if ($response -eq "s" -or $response -eq "S") {
    Write-Host ""
    Write-Host "[DEPLOY] Avvio deploy..." -ForegroundColor Cyan
    npm run deploy
} else {
    Write-Host ""
    Write-Host "Deploy annullato. Esegui 'npm run deploy' quando sei pronto." -ForegroundColor Cyan
}
