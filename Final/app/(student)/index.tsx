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
import { useTranslation } from 'react-i18next';

interface Transaction {
    id: string;
    amount: number;
    transaction_type: 'deposit' | 'purchase';
    description: string;
    status: string;
    created_at: string;
}

export default function StudentDashboard() {
    const { profile, refreshProfile } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const { t, i18n } = useTranslation();
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
                .neq('status', 'cancelled') // Hide cancelled transactions
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
        return date.toLocaleDateString(i18n.language) + ' ' + date.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
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
                        <Text style={styles(colors).greeting}>{t('common.welcome')}, {profile.full_name?.split(' ')[0]}!</Text>
                        <Text style={styles(colors).studentId}>{t('auth.studentId')}: {profile.student_id}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(student)/profile')}>
                        <Ionicons name="person-circle" size={40} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={styles(colors).walletCard}
                onPress={() => router.push('/(student)/wallet')}
            >
                <View style={styles(colors).walletHeader}>
                    <Ionicons name="wallet" size={32} color={colors.primary} />
                    <Text style={styles(colors).walletLabel}>{t('wallet.balance')}</Text>
                    <View style={{ flex: 1 }} />
                    <View style={{ backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                        <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 12 }}>+ {t('wallet.topUpShort')}</Text>
                    </View>
                </View>
                <Text style={styles(colors).balance}>{profile.wallet_balance.toLocaleString()} FCFA</Text>
            </TouchableOpacity>

            <View style={styles(colors).quickActions}>
                <Text style={styles(colors).sectionTitle}>{t('common.quickActions')}</Text>

                <View style={styles(colors).actionRow}>
                    <TouchableOpacity
                        style={styles(colors).actionCard}
                        onPress={() => router.push('/(student)/purchase')}
                    >
                        <Ionicons name="cart" size={28} color={colors.primary} />
                        <Text style={styles(colors).actionText}>{t('navigation.buyTickets')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles(colors).actionCard}
                        onPress={() => router.push('/(student)/tickets')}
                    >
                        <Ionicons name="ticket" size={28} color={colors.primary} />
                        <Text style={styles(colors).actionText}>{t('navigation.tickets')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles(colors).transactionsSection}>
                <Text style={styles(colors).sectionTitle}>{t('wallet.transactions')}</Text>

                {loadingTransactions ? (
                    <ActivityIndicator size="small" color={colors.textSecondary} />
                ) : transactions.length === 0 ? (
                    <Text style={styles(colors).emptyText}>{t('wallet.noTransactions')}</Text>
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
                                <Text style={styles(colors).txDescription}>
                                    {(() => {
                                        // Smart Localization for Transaction Descriptions
                                        let desc = tx.description;

                                        // Handle Bulk Purchase: "Purchase: 1 lunch, 2 breakfast"
                                        if (desc.startsWith('Purchase: ')) {
                                            desc = desc.replace('Purchase: ', t('wallet.purchasePrefix') + ': ');
                                            desc = desc.replace(/breakfast/gi, t('meals.breakfast'));
                                            desc = desc.replace(/lunch/gi, t('meals.lunch'));
                                            desc = desc.replace(/dinner/gi, t('meals.dinner'));
                                        }
                                        // Handle Single Purchase: "Bought lunch ticket"
                                        else if (desc.startsWith('Bought ')) {
                                            desc = desc.replace('Bought ', t('wallet.purchasePrefix') + ' ');
                                            desc = desc.replace(/ticket/gi, ''); // Remove 'ticket' word if desired or keep it
                                            desc = desc.replace(/breakfast/gi, t('meals.breakfast'));
                                            desc = desc.replace(/lunch/gi, t('meals.lunch'));
                                            desc = desc.replace(/dinner/gi, t('meals.dinner'));
                                        }
                                        // Handle Top-Ups
                                        else if (desc.includes('Online Top-Up')) {
                                            return t('wallet.onlineTopUp');
                                        }
                                        else if (desc.includes('Wallet top-up')) {
                                            return t('wallet.adminTopUp');
                                        }

                                        return desc;
                                    })()}
                                </Text>
                                <Text style={styles(colors).txDate}>{formatDate(tx.created_at)}</Text>
                            </View>
                            <Text style={[
                                styles(colors).txAmount,
                                { color: tx.transaction_type === 'deposit' ? colors.success : colors.danger }
                            ]}>
                                {tx.transaction_type === 'deposit' ? '+' : ''}{tx.amount} FCFA
                            </Text>
                            {/* Visual indicator for Pending/Expired */}
                            {(tx as any).status === 'pending' && (() => {
                                const created = new Date(tx.created_at).getTime();
                                const now = new Date().getTime();
                                // 30 seconds expiry for testing (30 * 1000)
                                const isExpired = (now - created) > 1 * 30 * 1000;

                                return (
                                    <Text style={{
                                        fontSize: 10,
                                        color: isExpired ? colors.textSecondary : '#f39c12',
                                        marginLeft: 5,
                                        fontStyle: isExpired ? 'italic' : 'normal'
                                    }}>
                                        ({isExpired ? t('wallet.expired') : t('wallet.pending')})
                                    </Text>
                                );
                            })()}
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
