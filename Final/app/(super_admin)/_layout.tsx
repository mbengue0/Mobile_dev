import { Stack } from 'expo-router';

import { useTranslation } from 'react-i18next';

export default function SuperAdminLayout() {
    const { t } = useTranslation();
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
                    title: t('navigation.users'),
                }}
            />
            <Stack.Screen
                name="system-settings"
                options={{
                    title: t('navigation.system'),
                }}
            />
            <Stack.Screen
                name="create-staff"
                options={{
                    title: 'Create Staff',
                }}
            />
        </Stack>
    );
}
