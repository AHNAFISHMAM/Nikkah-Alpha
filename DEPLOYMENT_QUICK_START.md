# 🚀 Quick Deployment Guide

**Fastest way to deploy Nikkah Alpha manually**

---

## ⚡ 5-Minute Deployment (Vercel)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

### Step 4: Add Environment Variables
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Step 5: Deploy to Production
```bash
vercel --prod
```

**Done!** Your app is live with HTTPS at `https://your-app.vercel.app`

---

## 📦 Manual Build & Upload

### Step 1: Build
```bash
npm run build
```

### Step 2: Verify Build
```bash
npm run preview
# Test at http://localhost:4173
```

### Step 3: Upload `dist/` Folder
- **Vercel/Netlify:** Drag & drop `dist/` folder
- **FTP:** Upload all files from `dist/` to `public_html/`
- **GitHub Pages:** Push `dist/` to `gh-pages` branch

### Step 4: Set Environment Variables
In your hosting provider's dashboard, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## ✅ Pre-Deployment Checklist

- [ ] Run `npm run verify:db` (check database counts)
- [ ] Run `npm run build` (test build)
- [ ] Run `npm run preview` (test locally)
- [ ] Test on mobile device
- [ ] Verify environment variables set

---

## 📱 Mobile Testing

After deployment, test on:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Tablet (iPad/Android)

**Key Checks:**
- Bottom navigation works
- Toast notifications visible
- Forms are touch-friendly
- No horizontal scrolling

---

## 🔗 Full Guide

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

