# GitHub Secrets Cleanup Instructions

## Why Remove These Secrets?

The secrets were set up for the CI/CD pipeline but:
- Supabase keys need to be rotated (they were exposed in git history)
- You want to manage these manually for now
- Can be re-added later when ready for automated deployment

## Steps to Delete

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click **Settings** (top menu)

2. **Access Secrets**
   - In left sidebar, expand **Secrets and variables**
   - Click **Actions**

3. **Delete Each Secret**
   Delete these 5 secrets by clicking the trash icon next to each:

   - ✅ `VITE_SUPABASE_URL`
   - ✅ `VITE_SUPABASE_ANON_KEY`
   - ✅ `VERCEL_TOKEN`
   - ✅ `VERCEL_ORG_ID`
   - ✅ `VERCEL_PROJECT_ID`

4. **Verify Deletion**
   - Secrets list should be empty
   - CI/CD pipeline will fail until secrets are re-added (this is expected)

## What Happens After Deletion?

- GitHub Actions workflows won't run the deploy job (will fail at build step)
- You can still run builds locally with `npm run build`
- When ready to re-enable CI/CD, add secrets back following `DEPLOYMENT.md`

## Optional: Disable GitHub Actions

If you want to prevent workflow runs entirely:
1. Go to **Settings** → **Actions** → **General**
2. Under **Actions permissions**, select **Disable actions**
3. Click **Save**

This prevents accidental workflow triggers.

---

**Note**: After rotating your Supabase keys (as documented in DEPLOYMENT.md), you can re-add the updated secrets to GitHub when you're ready to enable automated deployments again.
