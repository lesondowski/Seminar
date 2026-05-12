$ErrorActionPreference = 'Stop'

Write-Host 'Starting backend local environment...' -ForegroundColor Cyan

if (-not (Test-Path '.venv')) {
  python -m venv .venv
}

.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt

if (-not (Test-Path '.env')) {
  Copy-Item '.env.example' '.env'
  Write-Host 'Created .env from .env.example. Update DB credentials before running server.' -ForegroundColor Yellow
}

Write-Host 'Run SQL manually in MySQL:' -ForegroundColor Cyan
Write-Host '1) backend/sql/001_init_schema.sql' -ForegroundColor Gray
Write-Host '2) backend/sql/002_seed_local.sql' -ForegroundColor Gray
Write-Host '3) backend/sql/003_smoke_checks.sql' -ForegroundColor Gray

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
