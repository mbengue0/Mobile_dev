import { Slot, Stack, useRouter, useSegments, useRootNavigationState, usePathname } from 'expo-router';
import { View } from 'react-native';
import { QueryProvider } from '../providers/QueryProvider';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useEffect } from 'react';
import AnimatedSplashScreen from '../components/AnimatedSplashScreen';
import * as SplashScreen from 'expo-splash-screen';
import OfflineNotice from '../components/OfflineNotice';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AuthGuard() {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const pathname = usePathname();
    const rootNavigationState = useRootNavigationState();

    // Initialize notifications
    useNotifications();

    useEffect(() => {
        if (loading) return;
        if (!rootNavigationState?.key) return; // Wait for navigation to be ready

        const inAuthGroup = segments[0] === '(auth)';
        const inPublicGroup = segments[0] === 'public' || pathname?.startsWith('/public');

        if (!session && !inAuthGroup && !inPublicGroup) {
            // Redirect to login if not authenticated and not in auth/public group
            router.replace('/(auth)/login');
        } else if (session && inAuthGroup) {
            // Redirect to home if authenticated and trying to access auth screens
            // router.replace('/'); // Optional: Auto-login logic handling
        }
    }, [session, loading, segments, rootNavigationState, pathname]);

    return (
        <AnimatedSplashScreen isLoading={loading}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(student)" options={{ headerShown: false }} />
                <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                <Stack.Screen name="(super_admin)" options={{ headerShown: false }} />
                <Stack.Screen name="public" options={{ headerShown: false }} />
            </Stack>
        </AnimatedSplashScreen>
    );
}

import { ThemeProvider } from '../providers/ThemeProvider';

// ... existing imports ...

export default function RootLayout() {
    return (
        <QueryProvider>
            <AuthProvider>
                <ThemeProvider>
                    <View style={{ flex: 1, backgroundColor: '#132439' }}>
                        <OfflineNotice />
                        <AuthGuard />
                    </View>
                </ThemeProvider>
            </AuthProvider>
        </QueryProvider>
    );
}
