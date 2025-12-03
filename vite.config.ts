import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      // Fast Refresh is enabled by default - ensures HMR works properly
      // Include all files for HMR
      include: '**/*.{jsx,tsx}',
    }),
    tailwindcss(),
  ],
  server: {
    port: 5173, // ONLY ONE PORT - always reuse this
    strictPort: true, // Must use this port only (we kill it first)
    host: true, // Listen on all network interfaces
    cors: true, // Enable CORS
    open: false, // Don't auto-open browser
    hmr: {
      overlay: true, // Show errors in browser overlay
      port: 5173, // HMR uses the SAME port
      protocol: 'ws', // WebSocket protocol
      clientPort: 5173, // Explicit client port for HMR
      host: 'localhost', // Explicit host for HMR connection
    },
    watch: {
      // Enable polling for reliable file watching (especially on Windows)
      usePolling: true,
      interval: 200, // Check for changes every 200ms (balanced performance)
      binaryInterval: 300, // Check binary files every 300ms
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/.cursor/**',
        '**/.claude/**',
        '**/nul', // Ignore nul file
      ],
    },
  },
  // Optimize dependency pre-bundling for faster HMR
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react',
    ],
    force: false, // Don't force re-optimization on every start
  },
  // Define global constants for client-side only code
  define: {
    // Ensure we can check if code is running on client
    'import.meta.env.SSR': false,
    'import.meta.env.CLIENT': true,
  },
  build: {
    sourcemap: false, // No source maps in production
    minify: 'esbuild', // Fast minification
    target: 'es2020', // Modern browsers
    chunkSizeWarningLimit: 500, // Warn if chunk > 500KB
    cssCodeSplit: true, // Split CSS files
    assetsInlineLimit: 4096, // Inline assets < 4KB as base64
    rollupOptions: {
      output: {
        // Code splitting strategy for optimal loading
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
          'vendor-ui': ['lucide-react'],
          'vendor-data': ['@supabase/supabase-js', '@tanstack/react-query'],
        },
      },
    },
  },
})
