# Dev Server Management Scripts

## Quick Start

### Always Use This (Kills old server + Starts fresh):
```bash
npm run dev:restart
```

### Just Kill Server:
```bash
npm run dev:kill
```

### Regular Dev (if no server running):
```bash
npm run dev
```

## How It Works

- **`dev:restart`**: Kills any existing Vite server on port 5173, then starts a fresh one
- **`dev:kill`**: Just kills existing servers (useful for cleanup)
- **`dev`**: Standard Vite dev server (use only if no server is running)

## Important Notes

⚠️ **Vite already has Hot Module Replacement (HMR)** - your browser automatically updates when you save code changes. You don't need to restart the server for code changes.

🔄 **Use `dev:restart` when:**
- Starting a new coding session
- Port 5173 is already in use
- You want a completely fresh server state
- After pulling new dependencies

## Auto-Restart on Code Changes

Vite's HMR automatically updates your browser when you save files. No manual restart needed!

If you need a full server restart (rare), just run:
```bash
npm run dev:restart
```

