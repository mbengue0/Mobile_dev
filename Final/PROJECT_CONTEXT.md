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

### Authentication & User Management
1. **Authentication**: Login/Signup with self-healing profile creation
2. **Role-Based Access**: Student, Admin, and Super Admin roles
3. **Super Admin**: User management dashboard with role promotion

### Student Features
1. **Digital Wallet**: View balance, transaction history
2. **Ticket Purchase**: Buy single or batch tickets (up to 10)
3. **QR Tickets**: Display QR codes for meal validation
4. **Menu Display**: View daily menu images with fallback to recent menus
5. **Pull-to-Refresh**: Update menu and wallet balance

### Admin Features
1. **QR Scanner**: Validate tickets with time window enforcement
2. **Cashier**: Add funds to student wallets
3. **Menu Management**: Upload daily menu images to Supabase Storage
4. **Settings**: Logout functionality

### Super Admin Features
1. **User Management**: View all users, filter by role
2. **Role Promotion**: Promote students to admin
3. **System Settings**: Configure meal times and prices dynamically
   - Adjustable time windows for breakfast, lunch, dinner
   - Configurable prices per meal type
   - Reset to defaults option

### System Features
1. **Offline Support**: TanStack Query with caching
2. **Menu Fallback**: Shows recent menu if today's not uploaded
3. **Auto-Cleanup**: Function to delete menus older than 7 days
4. **Dynamic Validation**: Meal time windows read from database settings
5. **Scanner Race Condition Fix**: Prevents double-scan errors

## 📁 Database Organization
- `database/schema.sql`: Complete database schema
- `database/migrations/`: Sequential migration files
- `database/functions/`: Reusable database functions

## 📋 Recent Changes (Dec 2024)
- ✅ Implemented configurable meal settings system
- ✅ Fixed scanner double-scan race condition
- ✅ Added menu image fallback logic
- ✅ Organized SQL files into clean folder structure
- ✅ Fixed admin logout functionality
- ✅ Resolved menu image upload issues (0-byte files)

## 📄 Key Files
- `app/(student)/purchase.tsx`: Ticket purchase with dynamic pricing
- `app/(admin)/menu.tsx`: Menu upload with image picker
- `app/(admin)/scanner.tsx`: QR validation with time windows
- `app/(super_admin)/system-settings.tsx`: Configurable meal settings
- `database/migrations/004_create_system_settings.sql`: Settings table
- `database/migrations/005_update_validate_ticket.sql`: Dynamic validation
