# Manual Deployment Guide - Nikkah Alpha

Complete step-by-step guide for manually deploying the Nikkah Alpha application with HTTPS and mobile-first optimization.

---

## 📋 Pre-Deployment Checklist

### 1. Database Verification
```bash
# Run database count verification
node scripts/verify-database-counts.js
```

**Expected Results:**
- ✅ Checklist Items: 30+ (Expected: 31)
- ✅ Modules: 5 (Expected: 5)
- ✅ Discussion Prompts: 15+ (Expected: 16)
- ✅ Resources: 15+ (Expected: 24)

### 2. Environment Variables
Ensure you have:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**⚠️ Important:** Never commit `.env.local` or `.env` files to Git.

### 3. Build Verification
```bash
# Test production build locally
npm run build
npm run preview
```

**Verify:**
- ✅ Build completes without errors
- ✅ All pages load correctly
- ✅ No console errors
- ✅ Mobile responsive (test on actual device or browser DevTools)
- ✅ Authentication works
- ✅ All features functional

---

## 🏗️ Build Optimization (Mobile-First)

### Production Build Command
```bash
npm run build
```

### Build Output
- **Location:** `dist/` directory
- **Size Target:** < 500KB gzipped (main bundle)
- **Code Splitting:** Already configured in `vite.config.ts`

### Mobile-First Optimizations Already Included:
✅ **Code Splitting:**
- Vendor chunks separated (React, Router, Charts, Motion, UI, Data)
- Route-based lazy loading
- Dynamic imports for heavy components

✅ **Asset Optimization:**
- Images < 4KB inlined as base64
- CSS code splitting enabled
- Tree-shaking for unused code

✅ **Performance:**
- ES2020 target (modern browsers)
- esbuild minification (fastest)
- No source maps in production

---

## 🚀 Manual Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel:**
- ✅ Automatic HTTPS
- ✅ Global CDN (fast mobile loading)
- ✅ Zero-config deployment
- ✅ Free tier generous
- ✅ Built-in analytics
- ✅ Mobile-first edge network

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   # From project root
   vercel
   
   # Follow prompts:
   # - Set up and deploy? Yes
   # - Which scope? (your account)
   # - Link to existing project? No
   # - Project name? nikkah-alpha (or your choice)
   # - Directory? ./
   # - Override settings? No
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

5. **Redeploy with Environment Variables:**
   ```bash
   vercel --prod
   ```

6. **Verify Deployment:**
   - Visit the provided URL (e.g., `https://nikkah-alpha.vercel.app`)
   - Test on mobile device
   - Check HTTPS is enabled (padlock icon)

---

### Option 2: Netlify (Alternative)

**Why Netlify:**
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Drag-and-drop deployment
- ✅ Free tier available
- ✅ Form handling (if needed later)

**Steps:**

1. **Build Locally:**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify Dashboard:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign up/login
   - Click "Add new site" → "Deploy manually"
   - Drag and drop the `dist/` folder

3. **Set Environment Variables:**
   - Go to Site settings → Environment variables
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

4. **Redeploy:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

5. **Configure Custom Domain (Optional):**
   - Site settings → Domain management
   - Add custom domain
   - Follow DNS instructions

---

### Option 3: GitHub Pages (Free, but requires GitHub Actions)

**Why GitHub Pages:**
- ✅ Free hosting
- ✅ HTTPS enabled
- ✅ Custom domain support
- ⚠️ Requires GitHub Actions for build

**Steps:**

1. **Create GitHub Actions Workflow:**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
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
         
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Set GitHub Secrets:**
   - Repository → Settings → Secrets and variables → Actions
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Enable GitHub Pages:**
   - Repository → Settings → Pages
   - Source: GitHub Actions
   - Save

4. **Push to Main:**
   ```bash
   git push origin main
   ```

5. **Access Site:**
   - URL: `https://[username].github.io/[repository-name]`

---

### Option 4: Traditional Web Hosting (cPanel, FTP, etc.)

**Why Traditional Hosting:**
- ✅ Full control
- ✅ Custom server configuration
- ⚠️ Manual SSL setup required
- ⚠️ No automatic deployments

**Steps:**

1. **Build Locally:**
   ```bash
   npm run build
   ```

2. **Upload `dist/` Contents:**
   - Use FTP client (FileZilla, WinSCP)
   - Upload all files from `dist/` to `public_html/` (or your web root)

3. **Configure .htaccess (Apache):**
   Create `public_html/.htaccess`:
   ```apache
   # SPA Fallback - redirect all routes to index.html
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>

   # Security Headers
   <IfModule mod_headers.c>
     Header set X-Content-Type-Options "nosniff"
     Header set X-Frame-Options "DENY"
     Header set X-XSS-Protection "1; mode=block"
     Header set Referrer-Policy "strict-origin-when-cross-origin"
   </IfModule>

   # Cache Static Assets
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType text/css "access plus 1 year"
     ExpiresByType application/javascript "access plus 1 year"
     ExpiresByType image/png "access plus 1 year"
     ExpiresByType image/jpg "access plus 1 year"
     ExpiresByType image/jpeg "access plus 1 year"
     ExpiresByType image/gif "access plus 1 year"
     ExpiresByType image/svg+xml "access plus 1 year"
   </IfModule>

   # Gzip Compression
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
   </IfModule>
   ```

4. **Enable HTTPS:**
   - Use Let's Encrypt (free SSL)
   - Or purchase SSL certificate
   - Configure in hosting control panel

5. **Set Environment Variables:**
   - Build locally with environment variables
   - Or use hosting provider's environment variable feature (if available)

---

## 📱 Mobile-First Deployment Checklist

### Pre-Deployment Mobile Testing

1. **Test on Real Devices:**
   - ✅ iPhone (Safari)
   - ✅ Android (Chrome)
   - ✅ Tablet (iPad, Android tablet)

2. **Browser DevTools Testing:**
   - ✅ Responsive mode (320px, 375px, 428px, 768px, 1024px)
   - ✅ Touch simulation
   - ✅ Network throttling (3G, 4G)

3. **Performance Testing:**
   ```bash
   # Lighthouse audit (mobile)
   # In Chrome DevTools → Lighthouse → Mobile
   ```
   **Target Scores:**
   - Performance: 90+
   - Accessibility: 95+
   - Best Practices: 95+
   - SEO: 90+

4. **Mobile-Specific Checks:**
   - ✅ Bottom navigation visible and functional
   - ✅ Toast notifications appear correctly (bottom-center on mobile)
   - ✅ Forms are touch-friendly (min 44px tap targets)
   - ✅ No horizontal scrolling
   - ✅ Safe area insets respected (notches, home indicators)
   - ✅ Images load and display correctly
   - ✅ Charts/graphs are readable on small screens

---

## 🔒 Security Configuration

### HTTPS Requirements
- ✅ **Required:** All deployments must use HTTPS
- ✅ **Why:** Supabase requires HTTPS for production
- ✅ **Auto-enabled:** Vercel, Netlify, GitHub Pages
- ⚠️ **Manual:** Traditional hosting requires SSL setup

### Security Headers (Already in Build)
Your app includes:
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin

### Environment Variables Security
- ✅ **Never commit** `.env` or `.env.local` to Git
- ✅ **Use hosting provider's** environment variable feature
- ✅ **Rotate keys** if accidentally exposed

---

## ✅ Post-Deployment Verification

### 1. Functional Testing
- [ ] Signup works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Checklist items display (30+)
- [ ] Modules display (5)
- [ ] Discussion prompts display (15+)
- [ ] Resources display (15+)
- [ ] Financial calculators work
- [ ] Mahr tracker works
- [ ] Notes save correctly
- [ ] Progress tracking accurate

### 2. Mobile Testing
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test on tablet
- [ ] Bottom navigation works
- [ ] Toast notifications visible
- [ ] Forms are touch-friendly
- [ ] No horizontal scrolling
- [ ] Images load correctly

### 3. Performance Testing
- [ ] Lighthouse mobile score: 90+
- [ ] First Contentful Paint: < 1.5s
- [ ] Time to Interactive: < 3.5s
- [ ] Total bundle size: < 500KB gzipped

### 4. Security Testing
- [ ] HTTPS enabled (padlock icon)
- [ ] No mixed content warnings
- [ ] Environment variables not exposed in client code
- [ ] RLS policies working (test with non-admin user)

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working
- Verify variable names start with `VITE_`
- Check hosting provider's environment variable settings
- Rebuild after adding variables

### 404 Errors on Routes
- Ensure SPA fallback is configured (all routes → index.html)
- Check `.htaccess` (Apache) or `nginx.conf` (Nginx)

### Mobile Issues
- Clear browser cache
- Test in incognito mode
- Check viewport meta tag in `index.html`
- Verify safe-area-inset CSS is working

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase project is active
- Verify RLS policies allow public access where needed
- Check browser console for CORS errors

---

## 📊 Monitoring & Maintenance

### Recommended Tools
1. **Vercel Analytics** (if using Vercel)
   - Real-time performance metrics
   - Mobile vs desktop breakdown

2. **Google Analytics** (optional)
   - User behavior tracking
   - Mobile device insights

3. **Sentry** (optional)
   - Error tracking
   - Performance monitoring

### Regular Maintenance
- ✅ Monitor bundle size (keep < 500KB)
- ✅ Update dependencies monthly
- ✅ Review and optimize slow queries
- ✅ Test on new mobile devices/browsers
- ✅ Monitor Supabase usage/quota

---

## 🎯 Quick Reference

### Build Command
```bash
npm run build
```

### Output Directory
```
dist/
```

### Required Environment Variables
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Recommended Deployment Platform
**Vercel** - Easiest, fastest, mobile-optimized

### Mobile Testing
- Use real devices
- Test at 320px, 375px, 428px widths
- Verify touch targets ≥ 44px
- Check safe area insets

---

## 📝 Deployment Summary

**Recommended Approach:**
1. ✅ Verify database counts
2. ✅ Build locally and test
3. ✅ Deploy to Vercel (easiest) or Netlify
4. ✅ Set environment variables
5. ✅ Test on mobile devices
6. ✅ Verify HTTPS enabled
7. ✅ Run Lighthouse audit
8. ✅ Monitor performance

**Time Estimate:** 15-30 minutes for first deployment

---

## 🆘 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables
3. Test locally with `npm run preview`
4. Check Supabase dashboard for connection issues
5. Review deployment platform logs

---

**Last Updated:** 2025-01-31
**Version:** 1.0.0

