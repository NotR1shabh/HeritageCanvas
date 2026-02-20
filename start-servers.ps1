# Heritage Canvas - PM2 Quick Start Script
# Run this script to start both servers with PM2

Write-Host "Starting Heritage Canvas servers with PM2..." -ForegroundColor Cyan

# Resurrect saved PM2 processes
pm2 resurrect

# Wait a moment
Start-Sleep -Seconds 3

# Show status
pm2 list

Write-Host "`n✓ Servers are running!" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:4000" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "`nUseful PM2 commands:" -ForegroundColor Cyan
Write-Host "  pm2 list          - Show all processes"
Write-Host "  pm2 logs          - View live logs"
Write-Host "  pm2 restart all   - Restart both servers"
Write-Host "  pm2 stop all      - Stop both servers"
Write-Host "  pm2 delete all    - Remove all processes"
