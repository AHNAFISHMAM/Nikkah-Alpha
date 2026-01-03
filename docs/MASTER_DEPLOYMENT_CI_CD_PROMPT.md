# 🚀 MASTER DEPLOYMENT & CI/CD PROMPT
## Production-Grade Deployment, CI/CD, and Environment Management

---

## 📋 OVERVIEW

This master prompt provides a comprehensive approach to deploying React applications, setting up CI/CD pipelines, managing environments, and ensuring production readiness. It covers build optimization, deployment strategies, environment variables, monitoring, and rollback procedures.

**Applicable to:**
- Production builds and optimization
- Deployment to various platforms (Vercel, Netlify, etc.)
- CI/CD pipeline setup
- Environment variable management
- Pre-deployment checks
- Monitoring and health checks
- Rollback procedures

---

## 🎯 CORE PRINCIPLES

### 1. **Build Optimization**
- **Bundle Size**: Keep bundles small (<500KB gzipped)
- **Code Splitting**: Split code by route/feature
- **Asset Optimization**: Optimize images and fonts
- **Tree Shaking**: Remove unused code
- **Minification**: Minify JavaScript and CSS

### 2. **Environment Management**
- **Separate Environments**: Dev, Staging, Production
- **Environment Variables**: Never commit secrets
- **Build-time Variables**: Use VITE_ prefix for Vite
- **Runtime Configuration**: Validate required variables

### 3. **Deployment Safety**
- **Pre-deployment Checks**: Run checks before deploying
- **Staged Rollouts**: Deploy to staging first
- **Health Checks**: Verify deployment health
- **Rollback Plan**: Have rollback procedure ready

---

## 🔍 PHASE 1: BUILD OPTIMIZATION

### Step 1.1: Vite Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production
    minify: 'esbuild', // Fast minification
    target: 'es2020', // Modern browsers
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'chart-vendor': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Warn if chunk > 1MB
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Step 1.2: Build Verification Script
```typescript
// scripts/verify-build.ts
import { readFileSync, statSync } from 'fs'
import { join } from 'path'

const distPath = join(process.cwd(), 'dist')
const indexHtmlPath = join(distPath, 'index.html')

// Check if dist directory exists
if (!statSync(distPath).isDirectory()) {
  console.error('❌ dist directory not found. Run npm run build first.')
  process.exit(1)
}

// Check if index.html exists
if (!statSync(indexHtmlPath).isFile()) {
  console.error('❌ index.html not found in dist directory.')
  process.exit(1)
}

// Check bundle sizes
const assetsPath = join(distPath, 'assets')
const files = readFileSync(indexHtmlPath, 'utf-8')
const jsFiles = files.match(/assets\/[^"]+\.js/g) || []
const cssFiles = files.match(/assets\/[^"]+\.css/g) || []

let totalSize = 0
jsFiles.forEach((file) => {
  const filePath = join(distPath, file)
  if (statSync(filePath).isFile()) {
    const size = statSync(filePath).size
    totalSize += size
    console.log(`📦 ${file}: ${(size / 1024).toFixed(2)} KB`)
  }
})

console.log(`\n✅ Build verification complete`)
console.log(`📊 Total JS size: ${(totalSize / 1024).toFixed(2)} KB`)
console.log(`📊 Total JS size (gzipped): ~${(totalSize / 1024 / 3).toFixed(2)} KB`)

if (totalSize > 500 * 1024) {
  console.warn('⚠️  Bundle size exceeds 500KB. Consider code splitting.')
}
```

### Step 1.3: Build Checklist
- [ ] Build completes without errors
- [ ] Bundle sizes within limits
- [ ] Code splitting configured
- [ ] Assets optimized
- [ ] Source maps disabled in production
- [ ] Environment variables validated

---

## 🚀 PHASE 2: DEPLOYMENT SETUP

### Step 2.1: Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

```json
// vercel.json (optional configuration)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Step 2.2: Netlify Deployment
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

### Step 2.3: Environment Variables Setup
```bash
# Vercel
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Netlify (via dashboard or CLI)
netlify env:set VITE_SUPABASE_URL "your-url"
netlify env:set VITE_SUPABASE_ANON_KEY "your-key"
```

### Step 2.4: Deployment Checklist
- [ ] Platform account created
- [ ] Project linked to Git repository
- [ ] Environment variables configured
- [ ] Build command configured
- [ ] Output directory configured
- [ ] SPA routing configured
- [ ] Security headers configured

---

## 🔄 PHASE 3: CI/CD PIPELINE

### Step 3.1: GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npm run typecheck
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Step 3.2: Pre-deployment Checks Script
```typescript
// scripts/pre-deploy-check.ts
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

console.log('🔍 Running pre-deployment checks...\n')

// Check 1: Type checking
console.log('1. Running TypeScript type check...')
try {
  execSync('npm run typecheck', { stdio: 'inherit' })
  console.log('✅ Type check passed\n')
} catch (error) {
  console.error('❌ Type check failed')
  process.exit(1)
}

// Check 2: Linting
console.log('2. Running linter...')
try {
  execSync('npm run lint', { stdio: 'inherit' })
  console.log('✅ Linter passed\n')
} catch (error) {
  console.error('❌ Linter failed')
  process.exit(1)
}

// Check 3: Tests
console.log('3. Running tests...')
try {
  execSync('npm run test', { stdio: 'inherit' })
  console.log('✅ Tests passed\n')
} catch (error) {
  console.error('❌ Tests failed')
  process.exit(1)
}

// Check 4: Build
console.log('4. Running build...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build passed\n')
} catch (error) {
  console.error('❌ Build failed')
  process.exit(1)
}

// Check 5: Environment variables
console.log('5. Checking environment variables...')
const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
const missingVars = requiredVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
  console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`)
  process.exit(1)
}
console.log('✅ Environment variables present\n')

console.log('✅ All pre-deployment checks passed!')
```

### Step 3.3: CI/CD Checklist
- [ ] GitHub Actions workflow created
- [ ] Secrets configured in repository
- [ ] Pre-deployment checks automated
- [ ] Tests run in CI
- [ ] Build runs in CI
- [ ] Deployment automated on merge
- [ ] Rollback procedure documented

---

## 🔐 PHASE 4: ENVIRONMENT MANAGEMENT

### Step 4.1: Environment Variable Validation
```typescript
// src/lib/env.ts
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const

export function validateEnv() {
  const missing: string[] = []

  requiredEnvVars.forEach((varName) => {
    if (!import.meta.env[varName]) {
      missing.push(varName)
    }
  })

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }
}

// Call on app initialization
validateEnv()
```

### Step 4.2: Environment-Specific Configuration
```typescript
// src/lib/config.ts
const env = import.meta.env.MODE

export const config = {
  isDevelopment: env === 'development',
  isProduction: env === 'production',
  isStaging: env === 'staging',
  
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL!,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
  },
  
  api: {
    timeout: env === 'production' ? 10000 : 30000,
  },
  
  logging: {
    level: env === 'production' ? 'error' : 'debug',
  },
} as const
```

### Step 4.3: Environment Checklist
- [ ] Environment variables validated
- [ ] Separate configs for dev/staging/prod
- [ ] Secrets never committed
- [ ] .env.example file created
- [ ] Environment-specific features configured

---

## 📊 PHASE 5: MONITORING & HEALTH CHECKS

### Step 5.1: Health Check Endpoint
```typescript
// src/pages/public/HealthCheck.tsx (or API endpoint)
export function HealthCheck() {
  return (
    <div>
      <h1>Health Check</h1>
      <ul>
        <li>✅ Application: Running</li>
        <li>✅ Environment: {import.meta.env.MODE}</li>
        <li>✅ Build Time: {import.meta.env.VITE_BUILD_TIME || 'Unknown'}</li>
      </ul>
    </div>
  )
}
```

### Step 5.2: Build Time Injection
```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
  },
})
```

### Step 5.3: Monitoring Checklist
- [ ] Health check endpoint created
- [ ] Build time tracked
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Performance monitoring set up
- [ ] Uptime monitoring configured

---

## 🔄 PHASE 6: ROLLBACK PROCEDURES

### Step 6.1: Vercel Rollback
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Step 6.2: Netlify Rollback
```bash
# List deployments
netlify deploy:list

# Rollback to previous deployment
netlify deploy:rollback
```

### Step 6.3: Rollback Checklist
- [ ] Rollback procedure documented
- [ ] Previous deployments accessible
- [ ] Database migrations reversible (if applicable)
- [ ] Rollback tested in staging
- [ ] Team knows rollback procedure

---

## 🎯 SUCCESS CRITERIA

Deployment implementation is complete when:

1. ✅ **Build**: Optimized production build
2. ✅ **Deployment**: Automated deployment pipeline
3. ✅ **CI/CD**: Tests and checks run automatically
4. ✅ **Environment**: Environment variables managed securely
5. ✅ **Monitoring**: Health checks and monitoring configured
6. ✅ **Rollback**: Rollback procedure documented and tested
7. ✅ **Documentation**: Deployment process documented

---

## 🚨 COMMON PITFALLS

### ❌ Don't:
- Commit environment variables
- Deploy without running tests
- Skip pre-deployment checks
- Ignore build warnings
- Deploy on Fridays (if possible)
- Skip rollback testing

### ✅ Do:
- Use environment variables for secrets
- Run all checks before deploying
- Test in staging first
- Monitor deployments
- Have rollback plan ready
- Document deployment process

---

## 📝 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests passing
- [ ] Type check passing
- [ ] Linter passing
- [ ] Build successful
- [ ] Environment variables set
- [ ] Database migrations run (if applicable)
- [ ] Changelog updated

### Deployment
- [ ] Deploy to staging first
- [ ] Verify staging deployment
- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Check health endpoints
- [ ] Monitor error logs

### Post-Deployment
- [ ] Smoke test critical features
- [ ] Monitor performance metrics
- [ ] Check error tracking
- [ ] Verify analytics
- [ ] Document deployment

---

**This master prompt should be followed for ALL deployment and CI/CD work.**

