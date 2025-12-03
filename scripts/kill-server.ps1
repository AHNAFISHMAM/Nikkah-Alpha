# Kill Dev Server Script for Windows
# Kills any Vite dev server running on port 5173

$PORT = 5173

Write-Host "Killing servers on port $PORT..." -ForegroundColor Yellow

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
    Write-Host "✓ Servers killed" -ForegroundColor Green
} else {
    Write-Host "✓ No servers found" -ForegroundColor Green
}

