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
import { useTheme } from '../../providers/ThemeProvider';

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
    const { colors } = useTheme();
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
            <View style={styles(colors).container}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <ScrollView
            style={styles(colors).container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
        >
            <View style={styles(colors).header}>
                <View style={styles(colors).headerTop}>
                    <View>
                        <Text style={styles(colors).greeting}>Welcome, {profile.full_name?.split(' ')[0]}!</Text>
                        <Text style={styles(colors).studentId}>ID: {profile.student_id}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(student)/profile')}>
                        <Ionicons name="person-circle" size={40} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles(colors).walletCard}>
                <View style={styles(colors).walletHeader}>
                    <Ionicons name="wallet" size={32} color={colors.primary} />
                    <Text style={styles(colors).walletLabel}>Wallet Balance</Text>
                </View>
                <Text style={styles(colors).balance}>{profile.wallet_balance.toLocaleString()} FCFA</Text>
            </View>

            <View style={styles(colors).quickActions}>
                <Text style={styles(colors).sectionTitle}>Quick Actions</Text>

                <View style={styles(colors).actionRow}>
                    <TouchableOpacity
                        style={styles(colors).actionCard}
                        onPress={() => router.push('/(student)/purchase')}
                    >
                        <Ionicons name="cart" size={28} color={colors.primary} />
                        <Text style={styles(colors).actionText}>Buy Tickets</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles(colors).actionCard}
                        onPress={() => router.push('/(student)/tickets')}
                    >
                        <Ionicons name="ticket" size={28} color={colors.primary} />
                        <Text style={styles(colors).actionText}>My Tickets</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles(colors).transactionsSection}>
                <Text style={styles(colors).sectionTitle}>Recent Activity</Text>

                {loadingTransactions ? (
                    <ActivityIndicator size="small" color={colors.textSecondary} />
                ) : transactions.length === 0 ? (
                    <Text style={styles(colors).emptyText}>No recent transactions</Text>
                ) : (
                    transactions.map((tx) => (
                        <View key={tx.id} style={styles(colors).transactionItem}>
                            <View style={[
                                styles(colors).iconContainer,
                                { backgroundColor: tx.transaction_type === 'deposit' ? colors.success + '20' : colors.danger + '20' }
                            ]}>
                                <Ionicons
                                    name={tx.transaction_type === 'deposit' ? 'arrow-up' : 'arrow-down'}
                                    size={20}
                                    color={tx.transaction_type === 'deposit' ? colors.success : colors.danger}
                                />
                            </View>
                            <View style={styles(colors).txDetails}>
                                <Text style={styles(colors).txDescription}>{tx.description}</Text>
                                <Text style={styles(colors).txDate}>{formatDate(tx.created_at)}</Text>
                            </View>
                            <Text style={[
                                styles(colors).txAmount,
                                { color: tx.transaction_type === 'deposit' ? colors.success : colors.danger }
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

const styles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
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
        backgroundColor: colors.card,
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
        borderWidth: 1,
        borderColor: colors.border,
    },
    walletHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    walletLabel: {
        fontSize: 16,
        color: colors.textSecondary,
        marginLeft: 10,
        fontWeight: '500',
    },
    balance: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
    },
    quickActions: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        color: colors.text,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    actionCard: {
        backgroundColor: colors.card,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.border,
    },
    actionText: {
        fontSize: 14,
        marginTop: 10,
        color: colors.text,
        fontWeight: '600',
    },
    transactionsSection: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    transactionItem: {
        backgroundColor: colors.card,
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
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
        color: colors.text,
        marginBottom: 4,
    },
    txDate: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    txAmount: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    emptyText: {
        color: colors.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
    }
});
