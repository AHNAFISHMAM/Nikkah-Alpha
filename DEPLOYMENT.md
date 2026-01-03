# Deployment Guide - Nikkah Alpha

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Post-Deployment](#post-deployment)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Accounts
- ✅ Supabase account (database + backend)
- ✅ Vercel/Netlify account (hosting)
- ✅ GitHub account (CI/CD)
- ⚠️ **IMPORTANT**: Rotate your Supabase keys before deployment (see [Security](#security-checklist))

### Tools
```bash
# Install Node.js 18+
node --version  # Should be 18.x or higher

# Install Supabase CLI
npm install -g supabase

# Install Vercel CLI (optional)
npm install -g vercel
```

---

## Environment Setup

### 1. Rotate Supabase Keys (CRITICAL)

⚠️ **Your `.env` file was committed to Git history. You MUST rotate keys before deploying:**

1. Go to https://app.supabase.com/project/_/settings/api
2. Click **"Reset project API keys"**
3. Copy the new keys
4. Update all environments with new keys

### 2. Environment Variables

Create `.env` files for each environment:

#### Production `.env` (via hosting platform dashboard)
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key-here
VITE_SITE_URL=https://yourproductiondomain.com
```

#### Staging `.env` (via hosting platform dashboard)
```bash
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key
VITE_SITE_URL=https://staging.yoursite.com
```

### 3. GitHub Secrets (for CI/CD)

Add these secrets in your GitHub repository:
1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-vercel-org-id>
VERCEL_PROJECT_ID=<your-vercel-project-id>
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

#### A. Using Vercel CLI
```bash
# Install dependencies
npm ci

# Build locally to test
npm run build

# Deploy to Vercel
vercel --prod

# Follow prompts to:
# - Link to existing project or create new one
# - Set environment variables
```

#### B. Using GitHub Integration (Automatic)
1. Push code to GitHub
2. Connect repository to Vercel:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure build settings:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm ci`
3. Add environment variables in Vercel dashboard
4. Deploy!

**Automatic Deployments:**
- `main` branch → Production
- Other branches → Preview deployments

### Option 2: Netlify

#### A. Using Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

#### B. Using GitHub Integration
1. Go to https://app.netlify.com/start
2. Connect GitHub repository
3. Configure build settings (uses `netlify.toml`)
4. Add environment variables
5. Deploy!

### Option 3: Manual Deployment

```bash
# Build the project
npm run build

# Upload the dist/ folder to your hosting provider
# Ensure proper redirects for SPA routing
```

---

## Database Setup

### Initial Database Deployment

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Verify migrations
supabase migration list
```

### Seeding Data (if needed)
```bash
# Run seed scripts (if you have any)
supabase db reset  # Caution: This drops all data!
```

---

## Edge Functions Deployment

### Deploy Health Check Endpoint
```bash
# Deploy the health check function
supabase functions deploy health

# Set environment variable for CORS
supabase secrets set ALLOWED_ORIGIN=https://yourproductiondomain.com
```

### Deploy Delete Auth User Function
```bash
# Deploy the delete-auth-user function
supabase functions deploy delete-auth-user

# Set environment variable
supabase secrets set ALLOWED_ORIGIN=https://yourproductiondomain.com
```

### Test Edge Functions
```bash
# Test health endpoint
curl https://your-project-ref.supabase.co/functions/v1/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "version": "1.0.0"
# }
```

---

## Post-Deployment

### 1. Verify Deployment

#### Frontend Checks
- ✅ Visit your deployed URL
- ✅ Test user signup/login
- ✅ Check theme toggle
- ✅ Verify all routes load
- ✅ Test responsive design
- ✅ Check browser console for errors

#### Backend Checks
```bash
# Health check
curl https://your-domain.com/api/health

# Database connection
# Try logging in - should connect to Supabase
```

### 2. Security Checklist

- ✅ Supabase keys rotated
- ✅ `.env` not in Git
- ✅ HTTPS enabled
- ✅ Security headers configured (check vercel.json/netlify.toml)
- ✅ CORS configured correctly
- ✅ RLS policies enabled on all tables

### 3. Performance Checks

```bash
# Run Lighthouse audit
npm install -g lighthouse
lighthouse https://yoursite.com --view

# Check bundle size
npm run build
# Review dist/ folder sizes
```

### 4. Enable Backups

1. Go to Supabase Dashboard
2. Settings → Database → Backups
3. Enable automated backups
4. Set retention period (7-30 days)

---

## Monitoring

### Application Monitoring

#### Health Checks
```bash
# Set up uptime monitoring (use services like UptimeRobot, Pingdom)
# Monitor: https://yoursite.com
# Monitor: https://your-project-ref.supabase.co/functions/v1/health
```

#### Error Tracking (Optional - Recommended)
```bash
# Install Sentry (already configured in error-handler.ts)
npm install @sentry/react

# Configure in production:
# 1. Create Sentry project
# 2. Add SENTRY_DSN to environment variables
# 3. Uncomment Sentry code in src/lib/error-handler.ts
```

### Database Monitoring
- Monitor via Supabase Dashboard
- Check Database → Logs for errors
- Monitor API requests and usage

### CI/CD Monitoring
- Check GitHub Actions for build status
- Review deployment logs in Vercel/Netlify dashboard

---

## Troubleshooting

### Build Fails

**Issue**: TypeScript errors during build
```bash
# Solution: Run type check locally
npm run typecheck
# Fix any TypeScript errors
```

**Issue**: Missing dependencies
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Runtime Errors

**Issue**: "Failed to connect to Supabase"
- Check environment variables are set correctly
- Verify Supabase project is running
- Check API keys are valid

**Issue**: Blank page after deployment
- Check browser console for errors
- Verify routing configuration (index.html fallback)
- Check base URL in vite.config.ts

### Database Issues

**Issue**: Migration fails
```bash
# Check migration syntax
supabase migration list

# Reset and try again (staging only!)
supabase db reset
supabase db push
```

**Issue**: RLS policy blocking requests
- Review Supabase logs
- Check RLS policies in Database → Policies
- Verify user authentication is working

---

## Rollback Procedures

### Application Rollback

#### Vercel
```bash
# Via Dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "Promote to Production"

# Via CLI:
vercel rollback [deployment-url]
```

#### Netlify
```bash
# Via Dashboard:
# 1. Go to Deploys
# 2. Find previous deploy
# 3. Click "Publish deploy"
```

#### Manual
```bash
# Revert Git commit
git revert HEAD
git push origin main

# Or checkout previous commit
git checkout <previous-commit-hash>
git push origin main --force  # Caution!
```

### Database Rollback

⚠️ **CRITICAL**: Always backup before rollback!

```bash
# 1. Restore from Supabase backup
# Go to Dashboard → Database → Backups → Restore

# 2. Or create reverse migration
supabase migration new rollback_feature_name
# Write SQL to undo changes
supabase db push
```

---

## Maintenance Windows

### Planned Maintenance
1. Notify users 24-48 hours in advance
2. Schedule during low-traffic hours
3. Enable maintenance mode if needed:
   ```tsx
   // Add to App.tsx temporarily
   return <MaintenanceMode />
   ```
4. Perform updates
5. Verify functionality
6. Remove maintenance mode

---

## Performance Optimization

### Frontend Optimization
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer

# Check for large dependencies
npm install -g webpack-bundle-analyzer
```

### Database Optimization
- Add indexes on frequently queried columns
- Review slow queries in Supabase Dashboard
- Optimize RLS policies

---

## Security Best Practices

### Regular Security Tasks
- [ ] Rotate Supabase keys every 6 months
- [ ] Update dependencies monthly (`npm audit`)
- [ ] Review RLS policies quarterly
- [ ] Check Supabase logs for suspicious activity
- [ ] Update security headers as needed

### Incident Response
1. If credentials are compromised:
   - Immediately rotate Supabase keys
   - Review audit logs
   - Check for unauthorized access
   - Notify affected users if needed

---

## Checklist: First Deployment

### Pre-Deployment
- [ ] Rotate Supabase keys
- [ ] Remove `.env` from Git history (if needed)
- [ ] All tests passing (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables configured
- [ ] GitHub secrets added

### Deployment
- [ ] Database migrations pushed
- [ ] Edge functions deployed
- [ ] Frontend deployed to hosting
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

### Post-Deployment
- [ ] Health check endpoint works
- [ ] User signup/login works
- [ ] All features functional
- [ ] Security headers verified
- [ ] Performance metrics acceptable
- [ ] Error tracking configured
- [ ] Backups enabled
- [ ] Monitoring set up

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Project Issues**: Check GitHub Issues
- **Internal Docs**: See `docs/` folder

---

## Continuous Deployment

### Automatic Deployments (Configured)

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:
1. Runs on every push to `main` branch
2. Executes linting, type checking, and tests
3. Builds the project
4. Deploys to production (if all checks pass)

### Manual Deployment Trigger
```bash
# Trigger deployment manually
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

---

## Next Steps

After successful deployment:
1. ✅ Monitor application for 24 hours
2. ✅ Gather user feedback
3. ✅ Plan next iteration
4. ✅ Document any issues encountered
5. ✅ Update runbooks as needed

---

**Last Updated**: January 2026
**Version**: 1.0.0
