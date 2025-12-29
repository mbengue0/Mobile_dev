# Project Context: UniTicket - Multi-Tenant Campus Dining SaaS

## 🎯 Objective
Build an offline-first mobile app for campus dining management using **Expo SDK 54**, **Supabase**, and **React Native**. Designed as a scalable multi-tenant SaaS product.

## 🛠️ Tech Stack & Versions
- **Expo**: SDK 54
- **React**: `19.1.0`
- **React Native**: `0.81.5`
- **Reanimated**: `~3.16.1`
- **Supabase JS**: `^2.39.0`
- **Navigation**: `expo-router` v6
- **Notifications**: `expo-notifications` ~0.29.9
- **Animations**: `lottie-react-native` ^7.2.0

## ✅ Completed Features

### Branding & UX
1. **Animated Splash Screen**: Lottie animation with "UniTicket" branding
   - Smooth fade-out transition (800ms)
   - Minimum 2-second display for brand visibility
   - Clean white background with coral accent (#FF4757)

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
6. **Push Notifications**: Instant feedback on ticket purchases

### Admin Features
1. **QR Scanner**: Validate tickets with time window enforcement
2. **Cashier**: Add funds to student wallets
3. **Menu Management**: Upload daily menu images to Supabase Storage
4. **Settings Screen**: 
   - Profile information modal
   - Notification toggle (persisted to database)
   - Dark mode toggle (placeholder)
   - Logout functionality

### Super Admin Features
1. **User Management**: View all users, filter by role
2. **Role Promotion**: Promote students to admin
3. **System Settings**: Configure meal times and prices dynamically
   - Adjustable time windows for breakfast, lunch, dinner
   - Configurable prices per meal type
   - Reset to defaults option
   - Keyboard-aware input fields

### Notification System
1. **Local Notifications**: Instant feedback for user actions
2. **Push Token Management**: Device registration for future server push
3. **Notification Preferences**: User-controlled enable/disable
4. **Notification Logging**: Database tracking of all sent notifications
5. **Deep Linking**: Tap notifications to navigate to relevant screens
6. **Notification Types**:
   - Ticket Purchase: "Ticket Purchased! 🎫"
   - Wallet Top-up (ready for implementation)
   - System Alerts (ready for implementation)

### System Features
1. **Offline Support**: TanStack Query with caching
2. **Menu Fallback**: Shows recent menu if today's not uploaded
3. **Auto-Cleanup**: Function to delete menus older than 7 days
4. **Dynamic Validation**: Meal time windows read from database settings
5. **Scanner Race Condition Fix**: Prevents double-scan errors
6. **Dynamic Time Display**: Clean formatting (e.g., "7 AM - 11 AM")

## 📁 Database Organization
- `database/schema.sql`: Complete database schema
- `database/migrations/`: Sequential migration files (001-009)
- `database/functions/`: Reusable database functions

## 📋 Recent Changes (Dec 2024)
- ✅ **Multi-Tenant Rebranding**: "DAUST Cafeteria" → "UniTicket"
- ✅ **Animated Splash Screen**: Lottie animations with smooth transitions
- ✅ **Push Notification System**: Full implementation with local notifications
- ✅ **Admin Settings Improvements**: Functional profile modal, notification toggle
- ✅ Implemented configurable meal settings system
- ✅ Fixed scanner double-scan race condition
- ✅ Added menu image fallback logic
- ✅ Organized SQL files into clean folder structure
- ✅ Fixed admin logout functionality
- ✅ Resolved menu image upload issues (0-byte files)

## 📄 Key Files
- `components/AnimatedSplashScreen.tsx`: Branded splash with Lottie
- `services/NotificationService.ts`: Notification management singleton
- `hooks/useNotifications.ts`: Notification hook with deep linking
- `app/(student)/purchase.tsx`: Ticket purchase with notifications
- `app/(admin)/settings.tsx`: Functional settings with profile modal
- `app/(super_admin)/system-settings.tsx`: Configurable meal settings
- `database/migrations/009_add_notifications.sql`: Notification schema
- `database/migrations/004_create_system_settings.sql`: Settings table
- `database/migrations/005_update_validate_ticket.sql`: Dynamic validation
