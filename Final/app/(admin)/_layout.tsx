import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
    const { t } = useTranslation();
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#FF9500',
                headerShown: true,
            }}
        >
            <Tabs.Screen
                name="scanner"
                options={{
                    title: t('navigation.scanner'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="qr-code-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="cashier"
                options={{
                    title: t('navigation.cashier'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cash-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="menu"
                options={{
                    title: t('navigation.menu'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="restaurant-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: t('navigation.settings'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
