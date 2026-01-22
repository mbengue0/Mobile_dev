import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../../hooks/useAuth';

export default function WalletScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { profile, refreshProfile } = useAuth();

    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleTopUp = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) < 500) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount (Min 500 FCFA)');
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Initiate Payment via Edge Function
            const { data, error } = await supabase.functions.invoke('naboo-init', {
                body: { amount: Number(amount) }
            });

            if (error) {
                console.error("Full Edge Function Error:", error);

                // Try to parse the error body if available
                let serverMsg = error.message || "Unknown server error";
                try {
                    const parsed = JSON.parse(error.message);
                    if (parsed.error) serverMsg = parsed.error;
                } catch (e) { }

                throw new Error(serverMsg);
            }
            if (data?.error) {
                throw new Error(data.error);
            }

            // 2. Open Naboo Checkout
            if (data.url) {
                const result = await WebBrowser.openBrowserAsync(data.url);

                // 3. Handle Return
                // Since WebBrowser result type depends on platform/browser, general check:
                if (result.type === 'cancel' || result.type === 'dismiss') {
                    // User closed the browser manually
                    console.log('Browser closed');
                }

                // Refresh profile to see if balance updated (via webhook)
                // Note: Real-time update might depend on webhook speed. 
                // Currently just refreshing optimistically.
                setTimeout(() => refreshProfile(), 2000);
            }

        } catch (error: any) {
            console.error('Top Up Error (Details):', error);
            Alert.alert("Payment Failed", error.message || "Unknown Error");
        } finally {
            setIsProcessing(false);
            setAmount('');
        }
    };

    const styles = getStyles(colors);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Top Up Wallet</Text>
                </View>

                {/* Current Balance */}
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Current Balance</Text>
                    <Text style={styles.balance}>{profile?.wallet_balance.toLocaleString()} FCFA</Text>
                </View>

                {/* Top Up Form */}
                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Add Funds (Online)</Text>
                    <Text style={styles.subtitle}>Secure payment via NabooPay</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.currencySymbol}>FCFA</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Amount (e.g. 5000)"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            editable={!isProcessing}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.payButton,
                            (isProcessing || !amount) && styles.payButtonDisabled
                        ]}
                        onPress={handleTopUp}
                        disabled={isProcessing || !amount}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="card-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.payButtonText}>Pay Securely</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.disclaimer}>
                        Minimum deposit: 500 FCFA. Transactions are secured and processed instantly.
                    </Text>
                </View>

                {/* Offline Option */}
                <View style={[styles.formContainer, { marginTop: 20, borderColor: colors.border, backgroundColor: 'transparent' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
                            <Ionicons name="cash" size={24} color={colors.text} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.sectionTitle, { fontSize: 16 }]}>Pay with Cash?</Text>
                            <Text style={[styles.subtitle, { marginBottom: 0 }]}>
                                Visit an authorized Admin Cashier to top up your wallet manually.
                            </Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    backButton: {
        padding: 8,
        marginRight: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    card: {
        backgroundColor: colors.primary,
        padding: 25,
        borderRadius: 16,
        marginBottom: 30,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    cardLabel: {
        color: '#rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
    },
    balance: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
    },
    formContainer: {
        backgroundColor: colors.card,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20,
        height: 55,
    },
    currencySymbol: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textSecondary,
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    payButton: {
        backgroundColor: colors.success,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    payButtonDisabled: {
        backgroundColor: colors.textSecondary,
        opacity: 0.5,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disclaimer: {
        marginTop: 15,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
