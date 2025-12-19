import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!user || !profile) {
        return <Redirect href="/(auth)/login" />;
    }

    // Route based on role
    if (profile.role === 'super_admin') {
        return <Redirect href="/(super_admin)/users" />;
    }

    if (profile.role === 'admin') {
        return <Redirect href="/(admin)/scanner" />;
    }

    return <Redirect href="/(student)/" />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
