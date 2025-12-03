# Kill all Node.js processes and common dev ports
Write-Host "Killing all Node.js processes..." -ForegroundColor Yellow

# Kill all node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Killed all Node.js processes" -ForegroundColor Green

# Common dev ports to check
$ports = @(5173, 3000, 8080, 5000, 4000, 8000, 9000, 5174, 5175)

Write-Host ""
Write-Host "Killing processes on common dev ports..." -ForegroundColor Yellow
foreach ($port in $ports) {
    $connections = netstat -ano | findstr ":$port "
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
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "Killed process $processId on port $port" -ForegroundColor Green
                }
                catch {
                    # Process might already be dead
                }
            }
        }
    }
}

Write-Host ""
Write-Host "All ports cleared!" -ForegroundColor Green
