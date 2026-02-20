# SportPlanner Backend Starter
Write-Host "Iniciando Backend de SportPlanner..." -ForegroundColor Cyan

$backDir = "src/back/SportPlannerNW"

if (Test-Path $backDir) {
    cd $backDir
    # Usamos dotnet watch para que el servidor se reinicie solo al detectar cambios
    dotnet watch run --launch-profile "https"
} else {
    Write-Error "No se encontró el directorio del backend: $backDir"
}
