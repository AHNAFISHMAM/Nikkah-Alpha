# Start dev server with port cleanup
Write-Host "Starting dev server..." -ForegroundColor Cyan

# Kill processes on port 5173
$Port = 5173
$connections = netstat -ano | findstr ":$Port "
if ($connections) {
    $processIds = $connections | ForEach-Object { 
        $parts = $_ -split '\s+'
        if ($parts.Length -gt 0) {
            $parts[-1]
        }
    } | Select-Object -Unique
    
    foreach ($processId in $processIds) {
        if ($processId -match '^\d+$') {
            try {
                $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($proc -and ($proc.ProcessName -eq 'node' -or $proc.ProcessName -eq 'vite')) {
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "Killed process $processId on port $Port" -ForegroundColor Yellow
                }
            }
            catch {
                # Process might already be dead
            }
        }
    }
}

Start-Sleep -Milliseconds 300

# Start vite
Write-Host "Starting Vite on port $Port..." -ForegroundColor Green
& npm run vite:start

