# Levanta el backend EN VIVO del sales cockpit.
# Uso:  .\run.ps1
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

if (-not (Test-Path ".\.venv")) {
    Write-Host "Creando entorno virtual..." -ForegroundColor Cyan
    python -m venv .venv
}
& ".\.venv\Scripts\python.exe" -m pip install --quiet --upgrade pip
& ".\.venv\Scripts\python.exe" -m pip install --quiet -r requirements.txt

Write-Host "Comprueba 'az login' para el modo EN VIVO (Azure OpenAI)." -ForegroundColor Yellow
Set-Location ".\app"
& "..\.venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000
