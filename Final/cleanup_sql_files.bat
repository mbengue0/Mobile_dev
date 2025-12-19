@echo off
REM Script to delete temporary diagnostic SQL files

echo Deleting temporary diagnostic SQL files...

del /Q check_latest_upload.sql 2>nul
del /Q diagnose_and_fix_storage.sql 2>nul
del /Q final_storage_fix.sql 2>nul
del /Q fix_image_urls.sql 2>nul
del /Q test_menu_query.sql 2>nul
del /Q cleanup_menu_data.sql 2>nul
del /Q force_public_bucket.sql 2>nul
del /Q check_duplicates.sql 2>nul
del /Q fix_missing_profile.sql 2>nul

echo Done! Temporary SQL files cleaned up.
echo.
echo Your database files are now organized in the database/ folder:
echo   - database/schema.sql
echo   - database/migrations/
echo   - database/functions/
echo.
pause
