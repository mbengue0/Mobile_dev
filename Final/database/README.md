# Database Documentation

## Migrations
- `010_daily_overview.sql`: Updates `menu_images` table constraint to allow `daily_overview` as a meal type.

# Database Organization

This folder contains all database-related SQL files in an organized structure.

## 📁 Folder Structure

```
database/
├── schema.sql              # Main database schema (run this first)
├── migrations/            # One-time migrations (run once, then archive)
│   ├── 001_create_storage.sql
│   ├── 002_fix_menu_rls.sql
│   └── 003_fix_permissions.sql
├── functions/             # Reusable database functions
│   ├── cleanup_old_menus.sql
│   └── promote_user.sql
└── README.md             # This file
```

## 🚀 Setup Instructions

### First Time Setup:
1. Run `schema.sql` to create all tables, policies, and triggers
2. Run migrations in order (001, 002, 003...)
3. Create functions from `functions/` folder

### Maintenance:
- **Cleanup old menus**: Run `SELECT * FROM cleanup_old_menu_images();` weekly
- **Promote users**: Update via Super Admin dashboard (uses `promote_user` function)

## 🗑️ Deleted Files

The following debugging/diagnostic files have been removed:
- `check_latest_upload.sql` (temporary diagnostic)
- `diagnose_and_fix_storage.sql` (temporary diagnostic)
- `final_storage_fix.sql` (temporary diagnostic)
- `fix_image_urls.sql` (one-time manual fix)
- `test_menu_query.sql` (temporary diagnostic)
- `cleanup_menu_data.sql` (temporary diagnostic)
- `force_public_bucket.sql` (replaced by FIX_STORAGE_VIA_DASHBOARD.md)
- `check_duplicates.sql` (temporary diagnostic)
- `fix_missing_profile.sql` (incorporated into schema.sql)
