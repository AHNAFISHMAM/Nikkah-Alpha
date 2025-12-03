# Kill processes on port 5173 ONLY - this is the ONLY port we use
param([int]$Port = 5173)

Write-Host "Clearing port $Port (ONLY port in use)..." -ForegroundColor Yellow

# Get current process ID to avoid killing ourselves
$currentPid = $PID

# Kill processes on the specific port (but not the current process)
$connections = netstat -ano | findstr ":$Port "
if ($connections) {
    $processIds = $connections | ForEach-Object { 
        $parts = $_ -split '\s+'
        if ($parts.Length -gt 0) {
            $parts[-1]
        }
    } | Select-Object -Unique
    
    foreach ($processId in $processIds) {
        if ($processId -match '^\d+$' -and [int]$processId -ne $currentPid) {
            try {
                $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($proc -and ($proc.ProcessName -eq 'node' -or $proc.ProcessName -eq 'vite')) {
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "Killed process $processId ($($proc.ProcessName)) on port $Port" -ForegroundColor Green
                }
            }
            catch {
                # Process might already be dead
            }
        }
    }
}

# Wait a moment for ports to be released
Start-Sleep -Milliseconds 300

Write-Host "Port $Port is now free and ready to use" -ForegroundColor Green

