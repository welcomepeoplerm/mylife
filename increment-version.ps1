# increment-version.ps1 - PowerShell script per incrementare la versione
param(
    [string]$incrementType = "minor"
)

$versionFile = "src\version.js"
$packageFile = "package.json"

# Verifica esistenza file
if (-not (Test-Path $versionFile)) {
    Write-Host "ERROR: File $versionFile non trovato!" -ForegroundColor Red
    exit 1
}

# Leggi contenuto file versione
$content = Get-Content $versionFile -Raw

# Estrai versione corrente
if ($content -match "APP_VERSION = '(\d+)\.(\d+)\.(\d+)'") {
    $major = [int]$matches[1]
    $minor = [int]$matches[2]
    $patch = [int]$matches[3]
    
    $oldVersion = "$major.$minor.$patch"
    
    # Incrementa secondo il tipo richiesto
    switch ($incrementType.ToLower()) {
        "major" {
            $major++
            $minor = 0
            $patch = 0
        }
        "minor" {
            $minor++
            $patch = 0
        }
        "patch" {
            $patch++
        }
        default {
            $minor++
            $patch = 0
        }
    }
    
    $newVersion = "$major.$minor.$patch"
    
    Write-Host "Current version: $oldVersion" -ForegroundColor Yellow
    Write-Host "New version: $newVersion" -ForegroundColor Cyan
    Write-Host ""
    
    # Aggiorna file version.js
    $newContent = $content -replace "APP_VERSION = '\d+\.\d+\.\d+'", "APP_VERSION = '$newVersion'"
    [System.IO.File]::WriteAllText((Resolve-Path $versionFile), $newContent)
    Write-Host "Updated $versionFile" -ForegroundColor Green
    
    # Aggiorna package.json se esiste
    if (Test-Path $packageFile) {
        $pkgContent = Get-Content $packageFile -Raw
        $newPkgContent = $pkgContent -replace '"version": "\d+\.\d+\.\d+"', "`"version`": `"$newVersion`""
        [System.IO.File]::WriteAllText((Resolve-Path $packageFile), $newPkgContent)
        Write-Host "Updated $packageFile" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Version increment completed successfully!" -ForegroundColor Green
    exit 0
}
