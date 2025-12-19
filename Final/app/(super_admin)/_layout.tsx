import { Stack } from 'expo-router';

export default function SuperAdminLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#5856D6',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="users"
                options={{
                    title: 'User Management',
                }}
            />
        </Stack>
    );
}
