# Levanta el bot de Teams (Copilot Asistente Seguros) en local.
# Requiere el backend EN VIVO arrancado (live-backend) y, para Teams real,
# un Azure Bot + dev tunnel (ver README.md).
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

if (-not (Test-Path ".\.venv")) {
    Write-Host "Creando entorno virtual..." -ForegroundColor Cyan
    python -m venv .venv
}
& ".\.venv\Scripts\python.exe" -m pip install --quiet --upgrade pip
& ".\.venv\Scripts\python.exe" -m pip install --quiet -r requirements.txt

if (-not (Test-Path ".\.env")) { Copy-Item ".env.example" ".env"; Write-Host "Creado .env (rellena MICROSOFT_APP_ID/PASSWORD para Teams real)." -ForegroundColor Yellow }

Write-Host "Bot escuchando en http://localhost:3978/api/messages" -ForegroundColor Green
& ".\.venv\Scripts\python.exe" app.py
