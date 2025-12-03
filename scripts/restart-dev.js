#!/usr/bin/env node

/**
 * Restart Dev Server Script
 * Kills any existing Vite dev server and starts a fresh one
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import process from 'process';

const execAsync = promisify(exec);

const PORT = 5173;

async function killExistingServers() {
  try {
    // Find processes using the port (Windows)
    const { stdout } = await execAsync(`netstat -ano | findstr :${PORT}`);
    
    if (stdout) {
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      for (const line of lines) {
        const match = line.match(/\s+(\d+)\s*$/);
        if (match) {
          pids.add(match[1]);
        }
      }
      
      for (const pid of pids) {
        try {
          console.log(`Killing process ${pid}...`);
          await execAsync(`taskkill /F /PID ${pid}`);
        } catch (err) {
          // Process might already be dead, ignore
        }
      }
      
      // Wait a bit for ports to be released
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (err) {
    // No processes found, that's fine
    console.log('No existing servers found');
  }
}

async function startDevServer() {
  console.log('Starting fresh dev server...');
  const viteProcess = exec('npm run dev', {
    stdio: 'inherit',
    shell: true,
  });
  
  viteProcess.on('error', (err) => {
    console.error('Failed to start dev server:', err);
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down dev server...');
    viteProcess.kill();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    viteProcess.kill();
    process.exit(0);
  });
}

async function main() {
  console.log('🔄 Restarting dev server...');
  await killExistingServers();
  await startDevServer();
}

main().catch(console.error);

