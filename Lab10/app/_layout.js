import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'sensors') {
                        iconName = focused ? 'speedometer' : 'speedometer-outline';
                    } else if (route.name === 'media') {
                        iconName = focused ? 'camera' : 'camera-outline';
                    } else if (route.name === 'data') {
                        iconName = focused ? 'people' : 'people-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'tomato',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tabs.Screen
                name="sensors"
                options={{
                    title: 'Sensors',
                }}
            />
            <Tabs.Screen
                name="media"
                options={{
                    title: 'Media',
                }}
            />
            <Tabs.Screen
                name="data"
                options={{
                    title: 'Data',
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
