# Kill and Restart Dev Server Script for Windows
# This script kills any existing Vite dev server and starts a fresh one

$PORT = 5173

Write-Host "🔄 Restarting dev server..." -ForegroundColor Cyan

# Kill any processes using port 5173
Write-Host "Killing existing servers on port $PORT..." -ForegroundColor Yellow

$connections = netstat -ano | Select-String ":$PORT" | Select-String "LISTENING"

if ($connections) {
    $pids = $connections | ForEach-Object {
        $_.ToString().Split()[-1]
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        if ($pid -and $pid -ne "0") {
            try {
                Write-Host "  Killing process $pid..." -ForegroundColor Gray
                taskkill /F /PID $pid 2>$null
            } catch {
                # Process might already be dead
            }
        }
    }
    
    # Wait for ports to be released
    Start-Sleep -Seconds 1
    Write-Host "✓ Existing servers killed" -ForegroundColor Green
} else {
    Write-Host "✓ No existing servers found" -ForegroundColor Green
}

# Start fresh dev server
Write-Host "`n🚀 Starting fresh dev server..." -ForegroundColor Cyan
npm run predev
& npm run dev

