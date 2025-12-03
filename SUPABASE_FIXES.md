# Supabase Connection Fixes for Nikah Alpha

## Issue
This project (Nikah Alpha) is linked to the same Supabase project as another project, which can cause conflicts.

## Fixes Applied

### 1. Unique Storage Keys
Changed all localStorage keys to be unique to this project:
- **Auth storage**: `nikahprep-auth` → `nikah-alpha-auth`
- **Theme storage**: `brandTheme` → `nikah-alpha-brandTheme`
- **Theme mode**: `theme` → `nikah-alpha-theme`

### 2. Unique Application Identifier
- Changed `x-application-name` header from `NikahPrep` → `NikahAlpha`

### 3. Files Modified
- `src/lib/supabase.ts` - Updated storage key and application name
- `src/lib/applyThemeClass.ts` - Updated theme storage key
- `src/contexts/ThemeContext.tsx` - Updated theme localStorage key

## What This Fixes

1. **Session Conflicts**: Each project now has its own auth session storage
2. **Theme Conflicts**: Each project has its own theme preferences
3. **Request Tracking**: Supabase can distinguish requests from each project

## Testing

Visit `/test-connection` to verify:
- Environment variables are loaded
- Supabase connection works
- Database tables are accessible
- Auth is functioning

## Important Notes

- Both projects share the same database and users
- RLS policies apply to both projects
- Data created in one project is visible in the other
- Consider using separate Supabase projects for complete isolation

