# Email Reuse Fix - Quick Setup Guide

## ✅ What Was Fixed

The issue where deleted user emails couldn't be reused for new signups has been fixed. The solution properly deletes users from `auth.users` when accounts are deleted.

## 🚀 Setup Steps

### 1. Run Database Migration

Run this migration in your Supabase SQL Editor:
```sql
-- File: supabase/migrations/20250203000000_fix_user_deletion_auth_cleanup.sql
```

This adds helper functions for checking user existence.

### 2. Deploy Edge Function

Deploy the Edge Function that handles auth user deletion:

```bash
# Navigate to your project root
cd "C:\Users\Lenovo\Downloads\CODE\build fast\Nikkah Alpha"

# Deploy the function
supabase functions deploy delete-auth-user
```

**Important:** Set these secrets in Supabase Dashboard → Edge Functions → Settings:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (from Settings → API)

### 3. Clean Up Existing Orphaned Users

Run this in Supabase SQL Editor to see orphaned users:
```sql
-- First, run the view creation migration
-- File: supabase/migrations/20250203000001_cleanup_orphaned_auth_users.sql

-- Then check for orphaned users
SELECT * FROM v_orphaned_auth_users;
```

For each orphaned user, delete them via the Edge Function or manually in Supabase Dashboard → Authentication → Users.

### 4. Test the Fix

1. **Create a test account** with email `test@example.com`
2. **Delete the account** (via Profile → Delete Account)
3. **Try to sign up again** with the same email
4. **Should succeed!** ✅

## 📝 What Changed

### Files Modified:
- ✅ `src/hooks/useDeleteUserData.ts` - Now calls Edge Function to delete from auth.users
- ✅ `src/lib/supabase.ts` - Better error handling for existing emails

### Files Created:
- ✅ `supabase/migrations/20250203000000_fix_user_deletion_auth_cleanup.sql`
- ✅ `supabase/migrations/20250203000001_cleanup_orphaned_auth_users.sql`
- ✅ `supabase/functions/delete-auth-user/index.ts`
- ✅ `docs/USER_DELETION_EMAIL_REUSE.md` - Full documentation

## 🔧 How It Works

1. **User deletes account:**
   - Profile data is anonymized (existing behavior)
   - Edge Function is called to delete from `auth.users` (NEW)
   - Email becomes available for reuse

2. **User signs up with previously deleted email:**
   - Signup succeeds if auth user was properly deleted
   - Better error messages if email still exists

## ⚠️ Troubleshooting

### Edge Function Not Working?
- Check Edge Function logs in Supabase Dashboard
- Verify service role key is set as secret
- Ensure function is deployed: `supabase functions list`

### Email Still Can't Be Reused?
1. Check if user exists: `SELECT * FROM auth.users WHERE email = 'your-email@example.com';`
2. If exists, delete manually or via Edge Function
3. Try signup again

### Need Help?
See full documentation: `docs/USER_DELETION_EMAIL_REUSE.md`

## ✨ Next Steps

1. ✅ Run migrations
2. ✅ Deploy Edge Function
3. ✅ Clean up orphaned users
4. ✅ Test with a deleted email
5. ✅ Done! Emails can now be reused 🎉

