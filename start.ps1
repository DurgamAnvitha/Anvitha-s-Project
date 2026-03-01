# ========================================
# Smart Campus Management System Launcher
# ========================================
# Starts both Backend (Spring Boot) and Frontend (Vite) together.
# Run this script to start the whole application.

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Smart Campus Management System" -ForegroundColor Cyan
Write-Host "  Avanthi Institute ERP Launcher" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$rootDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $rootDir "MyCampusSmartDashboardSystem"
$frontendDir = Join-Path $rootDir "Frontend"

# --- Start Backend ---
Write-Host "[1/2] Starting Spring Boot Backend..." -ForegroundColor Yellow
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ""$backendDir""; Write-Host 'Backend starting...' -ForegroundColor Green; .\mvnw.cmd spring-boot:run" -PassThru

Write-Host "      Backend process started (PID: $($backendJob.Id))" -ForegroundColor Green
Write-Host "      Waiting 30 seconds for Spring Boot to initialize..." -ForegroundColor DarkGray

# Wait for backend to be ready
$ready = $false
$attempts = 0
while (-not $ready -and $attempts -lt 20) {
    Start-Sleep -Seconds 3
    $attempts++
    try {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/students" -TimeoutSec 2 -ErrorAction Stop
        $ready = $true
        Write-Host "      Backend READY! ($($res.Count) students loaded from Atlas)" -ForegroundColor Green
    } catch {
        Write-Host "      Waiting... ($($attempts * 3)s elapsed)" -ForegroundColor DarkGray
    }
}

if (-not $ready) {
    Write-Host "      Backend may still be starting. Proceeding to launch frontend anyway..." -ForegroundColor Yellow
}
# --- Start Frontend ---
Write-Host ""
Write-Host "[2/2] Starting Vite Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ""$frontendDir""; Write-Host 'Frontend starting...' -ForegroundColor Green; npm run dev" -PassThru

Write-Host "      Frontend process started (PID: $($frontendJob.Id))" -ForegroundColor Green
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Application is running!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend  : http://localhost:8080" -ForegroundColor White
Write-Host "  Database : MongoDB Atlas (cloud)" -ForegroundColor White
Write-Host ""
Write-Host "  Login Credentials:" -ForegroundColor White
Write-Host "    Admin   : admin / admin" -ForegroundColor Gray
Write-Host "    Teacher : isaac@avanthi.edu / 123456" -ForegroundColor Gray
Write-Host "    Student : lara@avanthi.edu / 123456" -ForegroundColor Gray
Write-Host ""
Write-Host "  Press CTRL+C or close this window to stop." -ForegroundColor DarkGray
Write-Host "============================================" -ForegroundColor Cyan

# Open browser automatically
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

# Keep script alive
Wait-Process -Id $backendJob.Id -ErrorAction SilentlyContinue
