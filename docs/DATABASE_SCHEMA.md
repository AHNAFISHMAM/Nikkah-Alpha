# Database Schema Documentation

## Overview

The Nikkah Alpha application uses **Supabase (PostgreSQL)** as its database. All tables have Row Level Security (RLS) enabled to ensure data privacy and security.

---

## Core Tables

### `profiles`
User profile information, created automatically on signup via trigger.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references auth.users |
| `email` | TEXT | User email address |
| `full_name` | TEXT | User's full name |
| `date_of_birth` | DATE | Date of birth |
| `gender` | TEXT | Gender (male/female/other) |
| `phone` | TEXT | Phone number |
| `country` | TEXT | Country of residence |
| `ethnicity` | TEXT | Ethnicity/background |
| `madhab` | TEXT | Islamic school of thought |
| `education_level` | TEXT | Highest education level |
| `occupation` | TEXT | Current occupation |
| `marital_status` | TEXT | Current marital status |
| `has_children` | BOOLEAN | Has children |
| `number_of_children` | INTEGER | Number of children |
| `avatar_url` | TEXT | Profile picture URL |
| `wedding_date` | DATE | Planned wedding date |
| `partner_id` | UUID | Connected partner's profile ID |
| `is_admin` | BOOLEAN | Admin privileges flag |
| `theme_mode` | TEXT | UI theme preference (light/dark/system) |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Users can read their own profile and their partner's profile
- Users can update only their own profile
- Admin users have elevated read access

---

### `partner_invitations`
Partner connection invitation system.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `sender_id` | UUID | User sending invitation |
| `receiver_email` | TEXT | Email of invitee |
| `status` | TEXT | pending/accepted/rejected/expired |
| `token` | TEXT | Unique invitation token |
| `expires_at` | TIMESTAMPTZ | Expiration timestamp |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `accepted_at` | TIMESTAMPTZ | Acceptance timestamp |

**RLS Policies:**
- Users can read their own invitations (sent or received)
- Users can create invitations
- Users can update invitations they sent

---

## Checklist Module

### `checklist_categories`
Predefined checklist categories.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Category name |
| `description` | TEXT | Category description |
| `icon` | TEXT | Icon identifier |
| `display_order` | INTEGER | Sort order |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**RLS Policies:**
- Public read access

---

### `checklist_template_items`
Template checklist items.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `category_id` | UUID | FK to checklist_categories |
| `title` | TEXT | Item title |
| `description` | TEXT | Item description |
| `estimated_duration` | TEXT | Estimated time needed |
| `recommended_timeline` | TEXT | When to complete |
| `display_order` | INTEGER | Sort order within category |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**RLS Policies:**
- Public read access

---

### `checklist_items`
User's checklist items (customizable).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `template_item_id` | UUID | FK to template (nullable) |
| `category_id` | UUID | FK to checklist_categories |
| `title` | TEXT | Item title |
| `description` | TEXT | Item description |
| `status` | TEXT | pending/in_progress/completed |
| `due_date` | DATE | Due date |
| `completed_at` | TIMESTAMPTZ | Completion timestamp |
| `notes` | TEXT | User notes |
| `is_custom` | BOOLEAN | Custom (not from template) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Users can manage (CRUD) their own checklist items
- Partner has read-only access

---

## Financial Module

### `wedding_budget`
Wedding budget planning.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `total_budget` | DECIMAL | Total budget amount |
| `venue` | DECIMAL | Venue budget |
| `catering` | DECIMAL | Catering budget |
| `photography` | DECIMAL | Photography budget |
| `clothing` | DECIMAL | Clothing/jewelry budget |
| `decor` | DECIMAL | Decorations budget |
| `invitations` | DECIMAL | Invitations budget |
| `other` | DECIMAL | Other expenses budget |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Users can manage their own budget
- Partner has read-only access

---

### `wedding_expenses`
Actual expenses tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `category` | TEXT | Expense category |
| `description` | TEXT | Expense description |
| `amount` | DECIMAL | Expense amount |
| `date` | DATE | Expense date |
| `vendor` | TEXT | Vendor name |
| `payment_status` | TEXT | paid/pending/partially_paid |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Users can manage their own expenses
- Partner has read-only access

---

### `savings_goals`
Savings goals for wedding.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `name` | TEXT | Goal name |
| `target_amount` | DECIMAL | Target amount |
| `current_amount` | DECIMAL | Current saved amount |
| `deadline` | DATE | Goal deadline |
| `status` | TEXT | active/completed/cancelled |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Users can manage their own goals
- Partner has read-only access

---

## Learning Modules

### `modules`
Educational content modules.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `module_number` | INTEGER | Module number |
| `title` | TEXT | Module title |
| `description` | TEXT | Module description |
| `content` | TEXT | HTML content |
| `estimated_duration` | TEXT | Estimated completion time |
| `display_order` | INTEGER | Sort order |
| `is_published` | BOOLEAN | Published status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Public read access for published modules
- Admin can manage all modules

---

### `module_progress`
User progress through modules.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `module_id` | UUID | FK to modules |
| `status` | TEXT | not_started/in_progress/completed |
| `started_at` | TIMESTAMPTZ | Start timestamp |
| `completed_at` | TIMESTAMPTZ | Completion timestamp |
| `notes` | TEXT | User notes |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Users can manage their own progress
- Partner has read-only access

---

### `module_notes`
User notes for modules.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `module_id` | UUID | FK to modules |
| `content` | TEXT | Note content |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Users can manage their own notes

---

## Discussion Module

### `discussion_prompts`
Discussion topics for couples.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `category` | TEXT | Discussion category |
| `prompt_text` | TEXT | Discussion prompt |
| `description` | TEXT | Detailed description |
| `importance` | TEXT | high/medium/low |
| `recommended_timeline` | TEXT | When to discuss |
| `display_order` | INTEGER | Sort order |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**RLS Policies:**
- Public read access

---

### `discussion_responses`
User responses to prompts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `prompt_id` | UUID | FK to discussion_prompts |
| `response` | TEXT | User's response |
| `is_private` | BOOLEAN | Privacy flag |
| `discuss_with_partner` | BOOLEAN | Share with partner flag |
| `discussed_at` | TIMESTAMPTZ | Discussion timestamp |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Users can manage their own responses
- Partner can read responses where `discuss_with_partner = true`

---

## Resources Module

### `resources`
Educational resources and articles.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Resource title |
| `description` | TEXT | Resource description |
| `type` | TEXT | article/video/pdf/link |
| `category` | TEXT | Resource category |
| `url` | TEXT | External URL (if applicable) |
| `content` | TEXT | Content (for articles) |
| `author` | TEXT | Author name |
| `published_date` | DATE | Publication date |
| `tags` | TEXT[] | Tags array |
| `is_featured` | BOOLEAN | Featured status |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Public read access
- Admin can manage resources

---

### `resource_favorites`
User's favorite resources.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to profiles |
| `resource_id` | UUID | FK to resources |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**RLS Policies:**
- Users can manage their own favorites

---

## Database Functions

### `get_partner_profile(user_uuid UUID)`
Returns the partner's profile if connected.

**Returns:** Profile record or NULL

**Usage:**
```sql
SELECT * FROM get_partner_profile(auth.uid());
```

---

### `accept_partner_invitation(invitation_uuid UUID)`
Accepts a partner invitation and creates the connection.

**Returns:** BOOLEAN (success/failure)

**Side Effects:**
- Updates invitation status to 'accepted'
- Sets partner_id for both users

---

### `check_invitation_rate_limit(email_input TEXT)`
Checks if too many invitations sent to an email.

**Returns:** BOOLEAN

**Rules:**
- Max 5 invitations per email per 24 hours

---

### `record_failed_invitation_attempt(email_input TEXT)`
Records a failed invitation attempt for rate limiting.

**Returns:** VOID

---

## Indexes

Performance-optimized indexes:
- `profiles.partner_id` - Partner lookups
- `profiles.email` - Email searches
- `checklist_items.user_id` - User checklist queries
- `module_progress.user_id, module_id` - Progress tracking
- `discussion_responses.user_id, prompt_id` - Discussion queries
- `partner_invitations.token` - Token validation

---

## Triggers

### `handle_new_user()`
Automatically creates a profile when a user signs up.

**Trigger:** AFTER INSERT ON auth.users

---

### `update_updated_at_column()`
Updates `updated_at` timestamp on row modification.

**Trigger:** BEFORE UPDATE ON multiple tables

---

## Row Level Security (RLS)

All tables have RLS enabled. General patterns:

1. **Own Data**: Users can manage their own data
2. **Partner Access**: Partners have read-only access to shared data
3. **Public Data**: Resources, modules, templates are publicly readable
4. **Admin Access**: Admin users have elevated permissions

---

## Backups & Recovery

- **Automated Backups**: Daily backups (configured in Supabase)
- **Retention**: 7-30 days (based on plan)
- **Point-in-Time Recovery**: Available on Pro+ plans
- **Manual Backups**: See [MIGRATIONS.md](../MIGRATIONS.md)

---

## Performance Considerations

- Indexes on all foreign keys
- Composite indexes on frequently queried columns
- Materialized views for complex aggregations (if needed)
- Connection pooling via Supabase
- Query optimization via RLS policies

---

## Related Documentation

- [Migrations Guide](../MIGRATIONS.md)
- [Security Policies](../SECURITY.md)
- [Deployment Guide](../DEPLOYMENT.md)

---

**Last Updated**: January 2026
