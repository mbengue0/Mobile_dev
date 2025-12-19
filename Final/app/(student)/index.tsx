import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function StudentDashboard() {
    const { profile, signOut, refreshProfile } = useAuth();
    const router = useRouter();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshProfile();
        setRefreshing(false);
    };

    if (!profile) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>Welcome, {profile.full_name}!</Text>
                <Text style={styles.studentId}>ID: {profile.student_id}</Text>
            </View>

            <View style={styles.walletCard}>
                <View style={styles.walletHeader}>
                    <Ionicons name="wallet" size={32} color="#007AFF" />
                    <Text style={styles.walletLabel}>Wallet Balance</Text>
                </View>
                <Text style={styles.balance}>{profile.wallet_balance} FCFA</Text>
            </View>

            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => router.push('/(student)/purchase')}
                >
                    <Ionicons name="cart" size={24} color="#007AFF" />
                    <Text style={styles.actionText}>Buy Tickets</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => router.push('/(student)/tickets')}
                >
                    <Ionicons name="ticket" size={24} color="#007AFF" />
                    <Text style={styles.actionText}>View My Tickets</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#007AFF',
        padding: 20,
        paddingTop: 40,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    studentId: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    walletCard: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    walletHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    walletLabel: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10,
    },
    balance: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#333',
    },
    quickActions: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    actionCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    actionText: {
        fontSize: 16,
        marginLeft: 15,
        color: '#333',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        margin: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
