# CloudOps Sentinel 1-Click Launcher
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Launching CloudOps Sentinel Platform" -ForegroundColor White
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Start Backend in separate window
Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Wait 2 seconds
Start-Sleep -Seconds 2

# 3. Start Frontend in separate window
Write-Host "[2/2] Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

# 4. Wait and open browser
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

Write-Host "Platform launched! Access at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Default Login: admin@cloudops.io / admin123" -ForegroundColor Yellow
