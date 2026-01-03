# Database Migrations Guide

## Overview

This document provides information about the database migration strategy for the Nikkah Alpha application.

## Migration Strategy

The project uses **Supabase migrations** with timestamp-based ordering. Migrations are executed in chronological order based on the timestamp prefix in their filename.

## Migration Files Location

All migration files are located in: `supabase/migrations/`

## Migration Execution Order

Migrations are executed automatically in alphabetical/chronological order by Supabase:

### Initial Setup (January 1-3, 2025)
1. `20250101000000_add_profile_fields.sql` - Initial profile fields
2. `20250102000000_add_profile_fields_complete.sql` - Complete profile schema
3. `20250103000000_profile_page_complete_migration.sql` - Profile page setup

### Core Features Setup (January 3, 2025)
4. `20250103000001_authenticated_home_setup.sql` - Home page database setup
5. `20250103000002_dashboard_setup.sql` - Dashboard tables and views
6. `20250103000003_checklist_setup.sql` - Checklist feature
7. `20250103000004_financial_setup.sql` - Financial planning tables
8. `20250103000005_modules_setup.sql` - Learning modules
9. `20250103000006_discussions_setup.sql` - Discussion prompts
10. `20250103000007_resources_setup.sql` - Resources and favorites

### Admin & Content (January 4-6, 2025)
11. `20250104000000_add_admin_role_and_policies.sql` - Admin roles and RLS
12. `20250105000000_insert_all_discussion_prompts.sql` - Seed discussion data
13. `20250106000000_insert_all_modules_and_lessons.sql` - Seed learning content
14. `20250106000001_remove_foundations_lessons.sql` - Content cleanup

### Feature Enhancements (January 7-31, 2025)
15. `20250107000000_add_module_notes_table.sql` - Module notes feature
16. `20250107000001_add_theme_mode_to_profiles.sql` - Theme preferences
17. `20250130000000_add_discuss_with_partner_column.sql` - Partner discussion flag
18. `20250130120000_pdf_generation_database_setup.sql` - PDF export setup
19. `20250131000000_remove_duplicate_discussion_prompts.sql` - Data cleanup
20. `20250131000001_create_partner_invitations.sql` - Partner invitation system

### Partner Access & Updates (February 1-3, 2025)
21-30. Partner access management and recent updates

## Initial Database Setup

For a **fresh database setup**, you have two options:

### Option 1: Run Migrations Sequentially (Recommended for Development)
```bash
# Using Supabase CLI
supabase db reset
supabase db push
```

### Option 2: Use Consolidated Setup (Faster for New Environments)
```bash
# Run the consolidated setup SQL file if available
# This includes all tables, policies, and initial data
# Located at: supabase/migrations/complete-setup-with-rls-consolidated.sql
```

## Running Migrations

### Local Development
```bash
# Start Supabase locally
supabase start

# Reset database and run all migrations
supabase db reset

# Push migrations to local database
supabase db push
```

### Production/Staging
```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push migrations to remote database
supabase db push
```

### Manual Execution
If you need to run migrations manually via the Supabase Dashboard:
1. Go to SQL Editor in your Supabase Dashboard
2. Execute migrations in chronological order
3. Verify each migration completes successfully before proceeding

## Creating New Migrations

```bash
# Create a new migration file
supabase migration new migration_name

# This creates a file like: supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql
```

### Migration Naming Convention
- Format: `YYYYMMDDHHMMSS_descriptive_name.sql`
- Use descriptive names (e.g., `add_email_verification_table.sql`)
- Include purpose in name (e.g., `update_`, `add_`, `remove_`, `fix_`)

## Row Level Security (RLS)

All tables have Row Level Security enabled with the following policies:

- **Profiles**: Users can read their own profile and their partner's profile
- **Checklists**: Users can manage their own checklists
- **Financial**: Users can manage their own financial data
- **Modules**: All users can read modules; progress is user-specific
- **Discussions**: Users can read all prompts; responses are user-specific
- **Resources**: All users can read resources; favorites are user-specific
- **Admin**: Special admin role with elevated permissions

## Rollback Strategy

### For Development
```bash
# Reset to a specific migration
supabase db reset

# Then manually apply migrations up to desired point
```

### For Production
⚠️ **WARNING**: Always test rollbacks in staging first!

1. Create a database backup before rolling back
2. Create a new migration that reverses the changes
3. Test thoroughly in staging environment
4. Apply to production with monitoring

## Backup Strategy

### Automated Backups
- Supabase provides automated daily backups (enabled by default in production)
- Backups retained for 7 days on Pro plan, 30 days on Team plan

### Manual Backups
```bash
# Export database schema
supabase db dump --schema public > backup_schema.sql

# Export data
supabase db dump --data-only > backup_data.sql
```

## Troubleshooting

### Migration Fails
1. Check Supabase logs for error details
2. Verify migration syntax in SQL Editor
3. Check for:
   - Missing dependencies (tables, columns)
   - Foreign key violations
   - Duplicate constraints
   - RLS policy conflicts

### Reset Everything (Development Only)
```bash
supabase db reset --local-only
```

### Check Migration Status
```bash
# List applied migrations
supabase migration list
```

## Important Notes

⚠️ **Critical Points**:
- Never modify existing migration files after they've been applied
- Always create new migrations for schema changes
- Test migrations in local/staging before production
- Keep migrations atomic (one logical change per migration)
- Document complex migrations with comments
- Backup production database before major migrations

## Migration Dependencies

Some migrations depend on others. The timestamp ordering ensures:
- Tables created before data insertion
- Columns added before indexes
- Parent tables before child tables (foreign keys)
- RLS policies after table creation

## Related Documentation

- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [SQL Schema Reference](./docs/DATABASE_SCHEMA.md)
- [Row Level Security Policies](./SECURITY.md)

## Support

For migration issues:
1. Check this documentation
2. Review Supabase logs
3. Check migration file syntax
4. Verify dependencies are in place
5. Contact development team if issues persist
