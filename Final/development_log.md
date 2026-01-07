# Development Issue Log

## 1. Admin Scanner Race Condition
**Issue:** rapid scanning caused the first successful scan to mark a ticket as used, but a second immediate scan (before UI update) would report "Ticket already used", confusing the user.
**Solution:** Implemented a `useRef` synchronous lock (`isScanning`) in `scanner.tsx` to strictly prevent multiple validation requests from firing concurrently.

## 2. Menu Image Upload Duplication
**Issue:** The image picker was triggered twice, or uploads were failing with 0-byte files.
**Solution:**
- Removed redundant `ImagePicker` calls.
- Switched from `fetch(uri)` to `FileSystem.readAsStringAsync` with base64 encoding for reliable file reading on Android/Expo Go.

## 3. System Settings Loading Stuck (Permissions)
**Issue:** The System Settings screen would be stuck on "Loading..." or show "Permission denied".
**Analysis:**
- Initially thought it was just missing data.
- Tried fixing RLS policies for `super_admin`, but they were not applying correctly.
- The terminal showed explicit `42501` permission errors.
**Solution:**
- Implemented a "Nuclear" permissions fix (`008_nuclear_permissions_fix.sql`).
- Explicitly `GRANT ALL` to `authenticated` and `public`.
- Simplified RLS policies to "Allow All Read" and "Allow Authenticated Write".
- Reseeded data to ensure valid JSON structure.

## 4. System Settings Crash (React Hooks)
**Issue:** `[Error: Rendered fewer hooks than expected]`
**Cause:** An early `return` statement in `system-settings.tsx` (checking for error) was placed *before* the `useMutation` hook. This violates React's Rules of Hooks.
**Solution:** Moved all hooks (including `useMutation`) to the top of the component, before any conditional return statements.

## 5. Keyboard Covering Input (System Settings)
**Issue:** Content gets hidden behind keyboard when typing prices.
**Solution:** Wrapped `ScrollView` in `KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`.

## 6. Time Formatting Mismatch
**Issue:** Student screen showed hardcoded times with minutes (e.g., 7:00 AM) even if settings were simple hours (7-11), and user preferred cleaner formatting.
**Solution:**
- Updated `purchase.tsx` to fetch dynamic `meal_times` from settings.
- Formatted display to omit minutes if they are zero (e.g., "7 AM - 11 AM").

## 7. Splash Screen Disappearing Too Quickly
**Issue:** The custom animated splash screen would sometimes flicker or disappear too quickly before the user could read the "UniTicket" branding, especially if auth loaded fast from cache.
**Solution:**
- Implemented a "minimum display time" logic using `setTimeout` and `Promise.all` logic.
- The splash screen now waits for *both* `authLoading === false` AND `minTimeElapsed === true` (set to 2000ms) before triggering the fade-out animation.

## 8. Expo Notifications in Expo Go (Invalid UUID)
**Issue:** `[Error: Error encountered while fetching Expo token... "projectId": Invalid uuid]`
**Analysis:** `Notifications.getExpoPushTokenAsync()` requires a valid EAS Project ID in `app.json` for production push notifications. In Expo Go development mode without an EAS project linkage, this fails.
**Solution:**
- Modified `NotificationService.ts` to swallow this specific error in development.
- Confirmed that **local notifications** (`Notifications.scheduleNotificationAsync`) still work perfectly in Expo Go without the push token, allowing development to proceed without full EAS setup.

## 9. TypeScript Interface Mismatches (Profile & Notifications)
**Issue:**
- `Property 'notifications_enabled' does not exist on type 'Profile'` in `settings.tsx`.
- `useRef` initialization errors in `useNotifications.ts`.
**Solution:**
- Updated the `Profile` interface in `hooks/useAuth.tsx` to include the new database fields: `push_token`, `notifications_enabled`, and `last_notification_at`.
- Fixed `useRef<Subscription | undefined>()` by explicitly initializing with `(undefined)`.

## 10. Project Reboot: Kanteen
**Action:** Rebranded entire project from "UniTicket" to **"Kanteen"**.
**Changes:** 
- Renamed project in `app.json`.
- Updated Splash Screen text.
- Established "Auto-Doc" protocol (Documentation First).
- Migrated context to `CONTEXT.md`.

## 11. Context Consolidation
**Action:** Merged `PROJECT_CONTEXT.md` into `CONTEXT.md` and deleted the redundant file.
**Reason:** Single Source of Truth rule compliance.

## 12. Splash Screen Refinement
**Issue:** User reported "too much red" in the splash screen, requesting better concordance.
**Solution:**
- Swapped colors: Main "Kanteen" text is now Dark Gray (`#333333`) for professional look.
- "Campus Dining SaaS" tagline is now Coral (`#FF4757`) as an accent.
## 13. Splash Screen Premium Redesign
**Action:** Overhauled `AnimatedSplashScreen.tsx`.
**Changes:**
- **Background**: Deep Navy Blue (`#003366`).
- **Typography**: White "Kanteen" + Gold (`#FFD700`) "Smart Campus Dining".
- **Icon**: Added `Ionicons` restaurant icon.
- **Animation**: Added `scale` transform (1 -> 1.5) parallel to opacity fade.

## 14. Brand Asset Generation
**Action:** Generated `kanteen_logo` asset.
**Details:**
- **Concept**: Fusion of QR Code and Cutlery.
- **Style**: Flat Vector, White on Deep Navy (#003366).
- **Purpose**: To replace default Expo icon and align with new SaaS identity.

## 15. Brand Assets Deployment
**Action:** Replaced app icons with `kanteen_logo`.
**Files Updated:**
- `assets/icon.png`: Main app icon.
- `assets/splash-icon.png`: Static splash image.
- `assets/adaptive-icon.png`: Android adaptive icon.

## 16. Asset Cache Clearing
**Issue:** New brand assets were not appearing in Expo Go (showing default placeholder).
**Action:** Performed `npx expo start --clear` to invalidate Metro bundler cache and force asset refresh.

**Action:** Performed `npx expo start --clear` to invalidate Metro bundler cache and force asset refresh.

## 17. Splash Screen Unification
**Issue:** "White Flash" during JS load caused visual disconnect from native Navy splash.
**Solution:**
- Added `<StatusBar barStyle="light-content" backgroundColor="#003366" />`.
- Verified JS background color matches native background exactly (`#003366`).

## 18. Auth Screen Premium Redesign
**Action:** Overhauled `login.tsx` and `signup.tsx`.
**Changes:**
- **Branding**: Replaced "DAUST" text with "Kanteen" Branding + Logo.
- **Theme**: Unified colors using Navy Blue (`#003366`), Faint Grey (`#F5F5F5`) inputs, and White background.
- **UI**: Added rounded corners (12px), bold buttons, and premium typography.
- **UX**: Added `KeyboardAvoidingView` and `ScrollView` for better form handling.

## 19. Auth Screen Immersive Theme Fix
**Issue:** White logo invisible on white background in auth screens.
**Solution:**
- Changed background to Navy Blue (`#003366`) to match splash screen.
- Updated title text to White and subtitle to Gold (`#FFD700`).
- Changed inputs to White for high contrast against Navy background.
- Inverted button colors: White background with Navy Blue text.
- Updated link colors to Light Grey (`#CCCCCC`) and Gold highlights.

## 20. Splash Screen Logo Consistency (Reverted)
**Initial Change:** Replaced `Ionicons` restaurant icon with logo image.
**User Feedback:** User preferred the restaurant icon for splash screen.
**Final Solution:** Restored `Ionicons` restaurant icon in splash screen. Login/signup screens use logo image.

## 21. Final Icon Deployment
**Action:** Deployed user's custom ticket/cutlery icon design across all app assets.
**Files Updated:**
- `assets/icon.png`: App icon
- `assets/splash-icon.png`: Splash screen icon
- `assets/adaptive-icon.png`: Android adaptive icon
- `components/AnimatedSplashScreen.tsx`: Updated to use image instead of Ionicons

## 22. Splash Screen Color Refinement
**Action:** Updated AnimatedSplashScreen background color.
**Change:** Changed from `#003366` to `#132439` (darker navy blue) for better contrast with white logo.

## 23. App-Wide Color Standardization
**Action:** Unified color scheme across entire Kanteen app.
**Changes:**
- **Login Screen**: Updated from `#003366` to `#132439`
- **Signup Screen**: Updated from `#003366` to `#132439`
- **Native Splash (app.json)**: Updated from `#003366` to `#132439`
- **Animated Splash**: Already using `#132439`
**Final Color Palette:**
- Primary Background: `#132439` (Deep Navy Blue)
- Accent: `#FFD700` (Gold)
- Text: `#FFFFFF` (White), `#CCCCCC` (Light Grey)
- Primary Background: `#132439` (Deep Navy Blue)
- Accent: `#FFD700` (Gold)
- Text: `#FFFFFF` (White), `#CCCCCC` (Light Grey)
- Inputs/Buttons: White backgrounds with Navy text for high contrast

## 24. Final Splash Screen Architecture Fix
**Issue:** Persistent white "ghost" background on splash screen.
**Root Cause:** Mixed config (app.json vs system default) and missing explicit native splash hiding logic.
**Solution:**
- Installed `expo-splash-screen`.
- Implemented `SplashScreen.preventAutoHideAsync()` in `_layout.tsx`.
- Implemented `SplashScreen.hideAsync()` in `AnimatedSplashScreen.tsx`.
- Added global fallback `backgroundColor: '#132439'` to `app.json` root.
- Wrapped Root Layout in a Navy Blue View as failsafe.

## 25. Final Logo Update (Tech Startup Vibe)
**Action:** Deployed new sleek QR+Cutlery logo.
**Updates:**
- `app.json`: Updated splash image to `assets/splash-new-v2.png` (Cache busting).
- `assets/icon.png`: Updated app icon.
- `assets/adaptive-icon.png`: Updated adaptive icon.
- `components/AnimatedSplashScreen.tsx`: Updated to use new splash asset.

## 26. Student Wallet Polish & Offline Support
**Action:** Refactored Student Wallet UI and added Global Offline Notice.
**Changes:**
- **Profile Screen:** Created `app/(student)/profile.tsx` for user details and logout.
- **Wallet Dashboard:**
    - Removed Logout button (moved to profile).
    - Added "Recent Activity" section fetching last 5 transactions from `wallet_transactions`.
    - Added Profile/Settings icon to header.
- **Offline Support:**
    - Created `components/OfflineNotice.tsx` using `@react-native-community/netinfo`.
    - Integrated `OfflineNotice` into `app/_layout.tsx` for global visibility.


## 27. Admin Dark Mode Implementation
**Action:** Implemented persistent Dark Mode for Admin interface.
**Changes:**
- **Infrastructure:**
    - Created `providers/ThemeProvider.tsx` with light/dark palettes and `AsyncStorage` persistence.
    - Integrated theme context into `app/_layout.tsx`.
- **Admin Screens:**
    - Refactored `app/(admin)/settings.tsx`: Added Dark Mode toggle switch.
    - Refactored `app/(admin)/cashier.tsx`, `menu.tsx`, `scanner.tsx` to consume `useTheme`.
- **Palette:** Navy Blue (`#132439`) background, Lighter Navy (`#1e3a5f`) cards, Gold (`#FFD700`) accents.

## 28. Remote Push Notifications
**Action:** Implemented "Client-Initiated" remote push notifications.
**Changes:**
- **Service Layer:**
    - Updated `services/NotificationService.ts`: Added `sendPushNotification(token, title, body, data)` method hitting Expo Push API.
- **Integration:**
    - Updated `app/(admin)/cashier.tsx`: Fetches student `push_token` during search and triggers `sendPushNotification` on successful top-up.

## 29. Student Dark Mode Implementation
**Action:** Extended Dark Mode to all Student-facing screens.
**Changes:**
- **Profile:** Added Dark Mode toggle switch to `app/(student)/profile.tsx`.
- **Wallet:** Themed dashboard cards, quick actions, and transaction list in `app/(student)/index.tsx`.
- **Purchase:** Themed meal selection cards, quantity inputs, and receipts in `app/(student)/purchase.tsx`.
- **Tickets:** Themed ticket list cards and QR code modal in `app/(student)/tickets.tsx`.
- **Result:** Consistent Navy Blue/Gold theme across the entire application.
