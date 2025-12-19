# Project Context: DAUST Cafeteria App

## 🎯 Objective
Build an offline-first mobile app for DAUST Cafeteria using **Expo SDK 54**, **Supabase**, and **React Native**.

## 🛠️ Tech Stack & Versions
- **Expo**: SDK 54
- **React**: `19.1.0`
- **React Native**: `0.81.5`
- **Reanimated**: `~3.16.1`
- **Supabase JS**: `^2.39.0`
- **Navigation**: `expo-router` v6

## ✅ Completed Features
1. **Authentication**: Login/Signup with self-healing profiles
2. **Student Flow**: Wallet, ticket purchase (batch), QR codes, pull-to-refresh menu
3. **Admin Flow**: QR Scanner, Cashier, Menu Upload, Settings with logout
4. **Super Admin**: User management, role promotion
5. **Menu Management**: Image upload to Supabase Storage, display in student purchase screen

## 🐛 Known Issues
1. **Menu Images Not Loading**: Storage bucket is public, files exist, database has records, but images don't display in app
   - Storage bucket verified as `public: true`
   - 8 files in storage, 3 records in database
   - Database URLs currently point to wrong format (investigating)

## 📋 Recent Changes
- Fixed admin logout (added Settings tab and screen)
- Fixed double image picker bug in `menu.tsx`
- Created multiple SQL scripts to fix storage permissions
- Added Pull-to-Refresh to student purchase screen

## 📄 Key Files
- `app/(admin)/menu.tsx`: Menu upload with image picker
- `app/(student)/purchase.tsx`: Ticket purchase with menu display
- `diagnose_and_fix_storage.sql`: Storage bucket diagnostic script
- `fix_menu_rls.sql`: RLS policy fix for menu updates
