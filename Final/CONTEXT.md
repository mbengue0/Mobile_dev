# Project Context: Kanteen - Multi-Tenant Dining SaaS

## 🎯 Objective
Build **Kanteen**, a white-label ready, offline-first mobile platform for university dining management using **Expo SDK 54**, **Supabase**, and **React Native**. Designed as a scalable **Multi-Tenant SaaS** product.

## 📜 The "Auto-Doc" Protocol
**Strict Adherence Required:**
1. Implement feature/code.
2. Update `README.md`, `CONTEXT.md`, and `development_LOG.md` immediately.
3. Confirm with: "✅ Feature implemented & Documentation updated."

## 🛠️ Tech Stack & Versions
- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript (Strict Mode)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Navigation**: Expo Router v6
- **State Management**: @tanstack/react-query v5
- **Offline Support**: AsyncStorage + React Query Persist + NetInfo
- **Notifications**: expo-notifications ~0.29.9
- **Animations**: lottie-react-native ^7.2.0
- **Config**: app.json with Config Plugins (Camera, Notifications)

## ✅ Core Features (Implemented)

### 🎨 Branding & UX
- **Identity**: "Kanteen" (formerly UniTicket/DAUST Cafeteria)
- **Assets**: Custom "QR + Cutlery" vector logo deployed (App Icon, Adaptive Icon).
- **Splash Screen**: Premium Deep Navy (#132439) with Gold accents. Scaling animation.
- **Offline Banner**: Global red status bar indicator when internet connection is lost.
- **Auth Screens**: Unified Navy Blue theme, clean typography, and logo integration.
- **Color Palette**: 
  - Primary: Deep Navy Blue `#132439`
  - Accent: Gold `#FFD700`
  - Text: White `#FFFFFF`, Light Grey `#CCCCCC`
  - Inputs/Buttons: White backgrounds with Navy text
- **Theme**: Consistent SaaS-ready UI with unified color scheme.
- **Dark Mode**: Admin Panel fully supported with persistent theme toggle.

### 👥 User Roles & Access
3. **Student**:
   - Digital Wallet (Balance, Transactions History)
   - Profile Management (View details, Logout)
   - Batch Ticket Purchase (Up to 10)
   - QR Ticket Generation
   - Menu Viewing (Image-based with fallback)
   - Push Notifications (Purchase confirmation)
2. **Admin**:
   - QR Scanner (Continuous, Time-window validated)
   - Cashier Mode (Add funds)
   - Menu Upload
   - Settings (Profile, Notifications)
3. **Super Admin**:
   - Tenant/System Configuration
   - Meal Time & Price Management
   - Role Management (Promote users)

### 🔔 Notification System
- **Architecture**: Expo Notifications + Supabase
- **Features**: Local alerts, Push token registration, Preference persistence.
- **Events**: Ticket Purchase (Implemented).

### ⚙️ System Architecture
- **Offline-First**: Optimistic updates and caching via TanStack Query.
- **Database**: Supabase PostgreSQL with RLS policies.
- **Scalability**: Designed for multi-tenancy (tenant isolation logic ready for expansion).

## 📁 Key File Structure
- `CONTEXT.md`: **Source of Truth** (This file).
- `app.json`: Configuration (Name: Kanteen).
- `app/_layout.tsx`: Root provider setup (Auth, Query, Notifications).
- `components/AnimatedSplashScreen.tsx`: Branding entry point.
- `services/NotificationService.ts`: Push notification logic.
- `database/`: Schema and migrations.

## 📋 Recent Changelog

### v1.0.3 - Admin Dark Mode (Jan 2025)
- **Feature**: Dark Mode toggle in Admin Settings.
- **Infrastructure**: Global `ThemeProvider` with AsyncStorage persistence.
- **UI**: Dynamic Navy Blue theme for Admin screens.

### v1.0.2 - Polish & Offline Support (Jan 2025)
- **Feature**: Global Offline Banner (`components/OfflineNotice.tsx`).
- **Feature**: Student Transaction History & Profile Screen.
- **UX**: Immersive Navy Blue Splash Screen & Icons.
- **Config**: Production-ready `app.json` (Deep Links, Permissions).

### v1.0.0 - Kanteen Reboot (Jan 2025)
- **Rebrand**: Project renamed to **Kanteen** (formerly UniTicket).
- **Protocol**: Adopted "Auto-Doc" workflow.
- **Feature**: Full Push Notification system implemented.
- **Feature**: Admin Settings overhaul (Profile modal, DB-persisted preferences).

### Dec 2024 Technical Milestones
- **Critical Fix**: Scanner double-scan race condition resolved.
- **Feature**: Configurable meal settings (Time windows & Prices).
- **Feature**: Menu image fallback logic & auto-cleanup.
- **Refactor**: Organized SQL migration structure.
