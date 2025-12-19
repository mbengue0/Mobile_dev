# DAUST Cafeteria Mobile App

A production-ready, offline-first mobile application for DAUST University cafeteria ticketing system built with **Expo SDK 54** and **Supabase**.

## 🎯 Features

### For Students
- **Digital Wallet**: View balance and transaction history
- **Batch Ticket Purchase**: Buy multiple tickets at once (up to 10)
- **QR Tickets**: Display QR codes for active tickets
- **Offline Support**: View purchased tickets even without internet
- **Real-time Updates**: Instant balance and ticket status updates

### For Admins
- **QR Scanner**: Continuous scan with time window validation
- **Cashier System**: Search users and add wallet funds
- **Menu Management**: Upload daily menu images (placeholder)
- **Time Validation**: Automatic meal time enforcement
  - Breakfast: 7:00 AM - 11:00 AM
  - Lunch: 12:00 PM - 3:00 PM
  - Dinner: 7:00 PM - 10:00 PM

### For Super Admins
- **User Management**: View all users with role filtering
- **Staff Promotion**: Promote students to admin role
- **System Overview**: Monitor all user accounts

## 🛠️ Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript (Strict Mode)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: @tanstack/react-query v5
- **Offline Support**: AsyncStorage + React Query Persist
- **Navigation**: Expo Router v4
- **Camera**: expo-camera v16
- **QR Codes**: react-native-qrcode-svg

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo Go app on your mobile device (iOS/Android)
- Supabase account and project

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd "c:\Users\DMTG TECH\Desktop\Final"
npm install
```

### 2. Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or use existing one
3. Go to **SQL Editor** and run the `schema.sql` file
4. Copy your project URL and anon key from **Settings > API**
5. Update `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create First Super Admin

1. Sign up a user via the app
2. In Supabase Dashboard → **Table Editor** → `profiles`
3. Find your user and change `role` from `student` to `super_admin`

### 4. Run the App

```bash
npm start
```

Scan the QR code with Expo Go app on your device.

## 📁 Project Structure

```
Final/
├── app/
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (student)/           # Student features
│   │   ├── index.tsx        # Wallet dashboard
│   │   ├── tickets.tsx      # My tickets with QR
│   │   └── purchase.tsx     # Buy tickets
│   ├── (admin)/             # Admin features
│   │   ├── scanner.tsx      # QR scanner
│   │   ├── cashier.tsx      # Add funds
│   │   └── menu.tsx         # Menu management
│   ├── (super_admin)/       # Super admin features
│   │   └── users.tsx        # User management
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── hooks/
│   └── useAuth.tsx          # Authentication hook
├── lib/
│   └── supabase.ts          # Supabase client
├── providers/
│   └── QueryProvider.tsx    # React Query setup
├── schema.sql               # Database schema
├── .env                     # Environment variables
└── package.json
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **SECURITY DEFINER Functions**: Prevent RLS recursion
- **Ghost Session Detection**: Auto-logout on profile corruption
- **Atomic Transactions**: Prevent double-spend and race conditions
- **Role-based Access**: Student/Admin/Super Admin permissions

## 🎨 Key Implementation Details

### Offline-First Architecture
- React Query with 5-minute stale time, 24-hour cache
- AsyncStorage persistence for tickets and wallet data
- Automatic background sync on reconnection

### Database RPCs
- `purchase_ticket`: Atomic ticket purchase with wallet deduction
- `validate_ticket`: Scanner validation with time windows
- `add_wallet_funds`: Admin-only wallet top-up
- `promote_user`: Super admin-only role promotion

### Self-Healing Auth
- Auto-create profile on signup via database trigger
- Auto-confirm email (bypass verification)
- Ghost session detection and cleanup

## 📱 Usage Guide

### Student Flow
1. **Sign Up**: Create account with email/password
2. **Add Funds**: Visit admin cashier to top up wallet
3. **Buy Tickets**: Select meal type and quantity
4. **Show QR**: Display ticket QR at cafeteria entrance
5. **Offline**: View tickets even without internet

### Admin Flow
1. **Scanner**: Scan student QR codes
   - Green = Valid ticket
   - Red = Invalid/Used/Wrong time
2. **Cashier**: Search user by email/ID and add funds
3. **Menu**: Upload daily menu images

### Super Admin Flow
1. **Users**: View all users with filtering
2. **Promote**: Upgrade students to admin staff

## 🐛 Troubleshooting

### "SupabaseClient is undefined"
- Ensure `react-native-url-polyfill/auto` is imported at the top of `lib/supabase.ts`
- Check that `.env` variables are set correctly

### Camera not working
- Grant camera permissions when prompted
- Ensure running on physical device (camera doesn't work in simulator)

### Tickets not loading offline
- Make sure you've viewed tickets at least once while online
- Check AsyncStorage permissions

### Time validation failing
- Ensure device time is correct
- Database uses UTC timezone

## 📄 License

MIT

## 👥 Credits

Built for DAUST University Cafeteria System
