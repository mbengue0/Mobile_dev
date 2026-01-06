import { Slot, Stack, useRouter, useSegments } from 'expo-router';
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

    // Initialize notifications
    useNotifications();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!session && !inAuthGroup) {
            // Redirect to login if not authenticated and not in auth group
            router.replace('/(auth)/login');
        } else if (session && inAuthGroup) {
            // Redirect to home if authenticated and trying to access auth screens
            // router.replace('/'); // Optional: Auto-login logic handling
        }
    }, [session, loading, segments]);

    return (
        <AnimatedSplashScreen isLoading={loading}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(student)" options={{ headerShown: false }} />
                <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                <Stack.Screen name="(super_admin)" options={{ headerShown: false }} />
            </Stack>
        </AnimatedSplashScreen>
    );
}

export default function RootLayout() {
    return (
        <QueryProvider>
            <AuthProvider>
                <View style={{ flex: 1, backgroundColor: '#132439' }}>
                    <OfflineNotice />
                    <AuthGuard />
                </View>
            </AuthProvider>
        </QueryProvider>
    );
}
