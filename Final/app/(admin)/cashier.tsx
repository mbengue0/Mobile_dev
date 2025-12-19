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

interface SearchResult {
    id: string;
    email: string;
    full_name: string;
    student_id: string;
    wallet_balance: number;
}

export default function CashierScreen() {
    const { user } = useAuth();
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
                .select('id, email, full_name, student_id, wallet_balance')
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
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (amountNum > 50000) {
            Alert.alert('Limit Exceeded', 'Maximum top-up is 50,000 FCFA');
            return;
        }

        Alert.alert(
            'Confirm Top-Up',
            `Add ${amountNum} FCFA to ${searchResult.full_name}'s wallet?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
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
                                    'Success',
                                    `Added ${amountNum} FCFA. New balance: ${data.new_balance} FCFA`
                                );
                                // Update local result
                                setSearchResult({
                                    ...searchResult,
                                    wallet_balance: data.new_balance,
                                });
                                setAmount('');
                            } else {
                                Alert.alert('Error', data.error);
                            }
                        } catch (error: any) {
                            Alert.alert('Transaction Failed', error.message);
                        } finally {
                            setProcessing(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.searchSection}>
                <Text style={styles.sectionTitle}>Search User</Text>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Enter email or student ID"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                    <View style={styles.searchIconContainer}>
                        {searching ? (
                            <ActivityIndicator color="#FF9500" />
                        ) : (
                            <Ionicons name="search" size={24} color="#ccc" />
                        )}
                    </View>
                </View>
            </View>

            {searchResult && (
                <View style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                        <Ionicons name="person-circle" size={48} color="#FF9500" />
                        <View style={styles.resultInfo}>
                            <Text style={styles.resultName}>{searchResult.full_name}</Text>
                            <Text style={styles.resultDetail}>{searchResult.email}</Text>
                            <Text style={styles.resultDetail}>ID: {searchResult.student_id}</Text>
                        </View>
                    </View>

                    <View style={styles.balanceContainer}>
                        <Text style={styles.balanceLabel}>Current Balance</Text>
                        <Text style={styles.balanceValue}>
                            {searchResult.wallet_balance} FCFA
                        </Text>
                    </View>

                    <View style={styles.addFundsSection}>
                        <Text style={styles.sectionTitle}>Add Funds</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="Enter amount (FCFA)"
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
                                        {quickAmount.toLocaleString()}
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
                                <Text style={styles.addButtonText}>Add Funds</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {!searchResult && !searching && (
                <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Search for a user to begin</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    searchIconContainer: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultCard: {
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
        color: '#333',
        marginBottom: 5,
    },
    resultDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    balanceContainer: {
        backgroundColor: '#FFF3E0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    balanceValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FF9500',
    },
    addFundsSection: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 20,
    },
    amountInput: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        fontSize: 18,
        marginBottom: 15,
        textAlign: 'center',
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
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF9500',
    },
    quickAmountText: {
        color: '#FF9500',
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: '#FF9500',
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
        color: '#999',
        marginTop: 15,
    },
});
