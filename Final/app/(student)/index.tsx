import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

interface Transaction {
    id: string;
    amount: number;
    transaction_type: 'deposit' | 'purchase';
    description: string;
    created_at: string;
}

export default function StudentDashboard() {
    const { profile, refreshProfile } = useAuth();
    const router = useRouter();
    const [refreshing, setRefreshing] = React.useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);

    const fetchTransactions = async () => {
        if (!profile?.id) return;

        try {
            const { data, error } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error fetching transactions:', error);
            } else {
                setTransactions(data || []);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refreshProfile(), fetchTransactions()]);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, [profile?.id]);

    if (!profile) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Welcome, {profile.full_name?.split(' ')[0]}!</Text>
                        <Text style={styles.studentId}>ID: {profile.student_id}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(student)/profile')}>
                        <Ionicons name="person-circle" size={40} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.walletCard}>
                <View style={styles.walletHeader}>
                    <Ionicons name="wallet" size={32} color="#007AFF" />
                    <Text style={styles.walletLabel}>Wallet Balance</Text>
                </View>
                <Text style={styles.balance}>{profile.wallet_balance.toLocaleString()} FCFA</Text>
            </View>

            <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(student)/purchase')}
                    >
                        <Ionicons name="cart" size={28} color="#007AFF" />
                        <Text style={styles.actionText}>Buy Tickets</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/(student)/tickets')}
                    >
                        <Ionicons name="ticket" size={28} color="#007AFF" />
                        <Text style={styles.actionText}>My Tickets</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.transactionsSection}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>

                {loadingTransactions ? (
                    <ActivityIndicator size="small" color="#666" />
                ) : transactions.length === 0 ? (
                    <Text style={styles.emptyText}>No recent transactions</Text>
                ) : (
                    transactions.map((tx) => (
                        <View key={tx.id} style={styles.transactionItem}>
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: tx.transaction_type === 'deposit' ? '#E8F5E9' : '#FFEBEE' }
                            ]}>
                                <Ionicons
                                    name={tx.transaction_type === 'deposit' ? 'arrow-up' : 'arrow-down'}
                                    size={20}
                                    color={tx.transaction_type === 'deposit' ? '#4CAF50' : '#F44336'}
                                />
                            </View>
                            <View style={styles.txDetails}>
                                <Text style={styles.txDescription}>{tx.description}</Text>
                                <Text style={styles.txDate}>{formatDate(tx.created_at)}</Text>
                            </View>
                            <Text style={[
                                styles.txAmount,
                                { color: tx.transaction_type === 'deposit' ? '#4CAF50' : '#F44336' }
                            ]}>
                                {tx.transaction_type === 'deposit' ? '+' : ''}{tx.amount} FCFA
                            </Text>
                        </View>
                    ))
                )}
            </View>
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
        paddingTop: 50,
        paddingBottom: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        marginHorizontal: 20,
        marginTop: -20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 25,
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
        fontWeight: '500',
    },
    balance: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#132439',
    },
    quickActions: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        color: '#333',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    actionCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionText: {
        fontSize: 14,
        marginTop: 10,
        color: '#333',
        fontWeight: '600',
    },
    transactionsSection: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    transactionItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    txDetails: {
        flex: 1,
    },
    txDescription: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    txDate: {
        fontSize: 12,
        color: '#999',
    },
    txAmount: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
    }
});
