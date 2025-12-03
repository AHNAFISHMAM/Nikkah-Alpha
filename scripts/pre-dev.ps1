# Pre-dev script: Kill any process using port 5173 before starting dev server
$PORT = 5173

Write-Host "Checking for processes on port $PORT..." -ForegroundColor Yellow

# Find processes using port 5173
$connections = netstat -ano | Select-String ":$PORT" | Select-String "LISTENING"

if ($connections) {
    Write-Host "Found processes using port $PORT. Killing them..." -ForegroundColor Yellow
    
    # Get process IDs using the port
    $pids = $connections | ForEach-Object {
        $parts = $_.ToString().Split() | Where-Object { $_ -ne "" }
        if ($parts.Length -gt 0) {
            $parts[-1]
        }
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        if ($pid -and $pid -ne "0") {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  Killing process $pid ($($process.ProcessName))..." -ForegroundColor Gray
                    taskkill /F /PID $pid 2>$null | Out-Null
                }
            } catch {
                # Process might already be dead, ignore
            }
        }
    }
    
    # Wait a moment for ports to be released
    Start-Sleep -Milliseconds 500
    Write-Host "Port $PORT cleared!" -ForegroundColor Green
} else {
    Write-Host "Port $PORT is free!" -ForegroundColor Green
}

