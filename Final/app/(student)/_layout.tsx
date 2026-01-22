import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function StudentLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                headerShown: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="tickets"
                options={{
                    title: 'My Tickets',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="ticket" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="purchase"
                options={{
                    title: 'Buy Tickets',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    title: 'Wallet',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="card" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
