import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';

import NotificationService from '../../services/NotificationService';
import { useTranslation } from 'react-i18next';

interface SearchResult {
    id: string;
    email: string;
    full_name: string;
    student_id: string;
    wallet_balance: number;
    push_token?: string; // Added push_token
}

export default function CashierScreen() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [amount, setAmount] = useState('');
    const [searching, setSearching] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    // Real-time search effect
    React.useEffect(() => {
        if (debounceTimer) clearTimeout(debounceTimer);

        if (!searchQuery.trim()) {
            setSearchResult(null);
            return;
        }

        const timer = setTimeout(() => {
            handleSearch(searchQuery);
        }, 500); // 500ms debounce

        setDebounceTimer(timer);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async (query: string) => {
        if (!query.trim()) return;

        setSearching(true);
        // Don't clear result immediately to prevent flicker
        // setSearchResult(null);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, student_id, wallet_balance, push_token') // Select push_token
                .or(`email.ilike.%${query}%,student_id.ilike.%${query}%`)
                .limit(1)
                .single();

            if (error) {
                // Ignore not found during typing, just clear result
                if (error.code === 'PGRST116') {
                    setSearchResult(null);
                } else {
                    console.error('Search error:', error);
                }
            } else {
                setSearchResult(data as SearchResult);
            }
        } catch (error: any) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleAddFunds = async () => {
        if (!searchResult) return;

        const amountNum = parseInt(amount);

        if (isNaN(amountNum) || amountNum <= 0) {
            Alert.alert(t('wallet.invalidAmount'), t('wallet.enterValidAmount'));
            return;
        }

        if (amountNum > 50000) {
            Alert.alert(t('admin.cashier.limitExceeded'), t('admin.cashier.maxTopUp'));
            return;
        }

        Alert.alert(
            t('admin.cashier.confirmTitle'),
            t('admin.cashier.confirmMsg', { amount: amountNum, name: searchResult.full_name }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.confirm'),
                    onPress: async () => {
                        setProcessing(true);

                        try {
                            const { data, error } = await supabase.rpc('add_wallet_funds', {
                                p_student_id: searchResult.id,
                                p_amount: amountNum,
                                p_admin_id: user?.id,
                            });

                            if (error) throw error;

                            if (data.success) {
                                Alert.alert(
                                    t('common.success'),
                                    t('admin.cashier.successMsg', { amount: amountNum, balance: data.new_balance })
                                );
                                // Update local result
                                setSearchResult({
                                    ...searchResult,
                                    wallet_balance: data.new_balance,
                                });
                                setAmount('');

                                // --- Send Notifications ---
                                const title = 'Wallet Update 💰';
                                const body = `Your wallet has been credited with ${amountNum} FCFA. New balance: ${data.new_balance} FCFA`;
                                const notifType = 'wallet_topup';
                                const notifData = { amount: amountNum, new_balance: data.new_balance };

                                // 1. Log to Database (User sees this in their "inbox" if built)
                                await NotificationService.logNotification(
                                    searchResult.id,
                                    title,
                                    body,
                                    notifType,
                                    notifData
                                );

                                // 2. Send Remote Push (User sees this on their lock screen)
                                if (searchResult.push_token) {
                                    await NotificationService.sendPushNotification(
                                        searchResult.push_token,
                                        title,
                                        body,
                                        { type: notifType, ...notifData }
                                    );
                                }
                            } else {
                                Alert.alert(t('common.error'), data.error);
                            }
                        } catch (error: any) {
                            Alert.alert(t('admin.cashier.transactionFailed'), error.message);
                        } finally {
                            setProcessing(false);
                        }
                    },
                },
            ]
        );
    };

    const styles = getStyles(colors);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.searchSection}>
                <Text style={styles.sectionTitle}>{t('admin.cashier.title')}</Text>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('admin.cashier.placeholder')}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                    <View style={styles.searchIconContainer}>
                        {searching ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : (
                            <Ionicons name="search" size={24} color={colors.textSecondary} />
                        )}
                    </View>
                </View>
            </View>

            {searchResult && (
                <View style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                        <Ionicons name="person-circle" size={48} color={colors.primary} />
                        <View style={styles.resultInfo}>
                            <Text style={styles.resultName}>{searchResult.full_name}</Text>
                            <Text style={styles.resultDetail}>{searchResult.email}</Text>
                            <Text style={styles.resultDetail}>ID: {searchResult.student_id}</Text>
                        </View>
                    </View>

                    <View style={styles.balanceContainer}>
                        <Text style={styles.balanceLabel}>{t('admin.cashier.currentBalance')}</Text>
                        <Text style={styles.balanceValue}>
                            {searchResult.wallet_balance} FCFA
                        </Text>
                    </View>

                    <View style={styles.addFundsSection}>
                        <Text style={styles.sectionTitle}>{t('wallet.topUp')}</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder={t('admin.cashier.amountPlaceholder')}
                            placeholderTextColor={colors.textSecondary}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="number-pad"
                        />

                        <View style={styles.quickAmounts}>
                            {[1000, 2000, 5000, 10000].map((quickAmount) => (
                                <TouchableOpacity
                                    key={quickAmount}
                                    style={styles.quickAmountButton}
                                    onPress={() => setAmount(String(quickAmount))}
                                >
                                    <Text style={styles.quickAmountText}>
                                        {quickAmount.toLocaleString(i18n.language)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                processing && styles.addButtonDisabled,
                            ]}
                            onPress={handleAddFunds}
                            disabled={processing || !amount}
                        >
                            {processing ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.addButtonText}>{t('admin.cashier.confirm')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {!searchResult && !searching && (
                <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
                    <Text style={styles.emptyText}>{t('admin.cashier.subtitle')}</Text>
                </View>
            )}
        </ScrollView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchSection: {
        backgroundColor: colors.card,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: colors.text,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIconContainer: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultCard: {
        backgroundColor: colors.card,
        margin: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    resultHeader: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    resultInfo: {
        marginLeft: 15,
        flex: 1,
    },
    resultName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 5,
    },
    resultDetail: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    balanceContainer: {
        backgroundColor: colors.background,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    balanceLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 5,
    },
    balanceValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
    },
    addFundsSection: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 20,
    },
    amountInput: {
        backgroundColor: colors.background,
        padding: 15,
        borderRadius: 8,
        fontSize: 18,
        marginBottom: 15,
        textAlign: 'center',
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quickAmounts: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    quickAmountButton: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    quickAmountText: {
        color: colors.primary,
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 15,
    },
});
