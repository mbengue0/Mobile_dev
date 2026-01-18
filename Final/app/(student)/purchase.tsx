import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
    ActivityIndicator,
    Image,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../providers/ThemeProvider';
import { useSystemSettings } from '../../hooks/useSystemSettings';

type MealType = 'breakfast' | 'lunch' | 'dinner';

interface MealPrices {
    breakfast: number;
    lunch: number;
    dinner: number;
}

interface MealTimes {
    breakfast: { start: number; end: number };
    lunch: { start: number; end: number };
    dinner: { start: number; end: number };
}

export default function PurchaseScreen() {
    const { user, profile, refreshProfile } = useAuth();
    const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
    const [quantity, setQuantity] = useState('1');
    const [imageError, setImageError] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const { sendNotification } = useNotifications();
    const { colors } = useTheme();

    // Fetch dynamic system settings via centralized hook
    const { data: systemSettings, isLoading: settingsLoading } = useSystemSettings();

    const currentPrice = systemSettings?.mealPrices?.[selectedMeal] || 0;

    const { data: menuImage, refetch: refetchMenu } = useQuery({
        queryKey: ['menu_image', selectedMeal],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];

            // 1. Try to get Today's Specific Meal Image
            const { data: specificMeal, error: specificError } = await supabase
                .from('menu_images')
                .select('image_url, menu_date, meal_type')
                .eq('meal_type', selectedMeal)
                .eq('menu_date', today)
                .single();

            if (specificMeal) return { ...specificMeal, isDaily: false };

            // 2. Fallback: Try to get Today's "Daily Overview" Poster
            const { data: dailyOverview } = await supabase
                .from('menu_images')
                .select('image_url, menu_date, meal_type')
                .eq('meal_type', 'daily_overview')
                .eq('menu_date', today)
                .single();

            if (dailyOverview) return { ...dailyOverview, isDaily: true };

            // 3. Last Resort: Most Recent Specific Meal (e.g. yesterday)
            const { data: recentMenu } = await supabase
                .from('menu_images')
                .select('image_url, menu_date, meal_type')
                .eq('meal_type', selectedMeal)
                .gte('menu_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                .order('menu_date', { ascending: false })
                .limit(1)
                .single();

            return recentMenu ? { ...recentMenu, isDaily: false } : null;
        },
    });

    // Reset error when meal type changes
    React.useEffect(() => {
        setImageError(false);
    }, [selectedMeal]);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            refetchMenu(),
            refreshProfile(),
        ]);
        setRefreshing(false);
    }, [refetchMenu, refreshProfile]);

    const purchaseMutation = useMutation({
        mutationFn: async ({ mealType, qty }: { mealType: MealType; qty: number }) => {
            const results = [];
            const price = systemSettings?.mealPrices?.[mealType] || 0;

            for (let i = 0; i < qty; i++) {
                const { data, error } = await supabase.rpc('purchase_ticket', {
                    p_student_id: user?.id,
                    p_meal_type: mealType,
                    p_meal_date: new Date().toISOString().split('T')[0],
                    p_price: price,
                });

                if (error) throw error;
                if (!data.success) throw new Error(data.error);
                results.push(data);
            }

            return results;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tickets', user?.id] });
            refreshProfile();

            // Send notification
            const qty = parseInt(quantity) || 1;
            sendNotification(
                'Ticket Purchased! 🎫',
                `Your ${selectedMeal} ticket${qty > 1 ? 's' : ''} ${qty > 1 ? 'are' : 'is'} ready to use`,
                'ticket_purchase',
                { meal_type: selectedMeal, quantity: qty }
            );

            Alert.alert(
                'Success!',
                `Successfully purchased ${quantity} ticket(s)`,
                [
                    {
                        text: 'View Tickets',
                        onPress: () => router.push('/(student)/tickets'),
                    },
                    { text: 'OK' },
                ]
            );
            setQuantity('1');
        },
        onError: (error: any) => {
            Alert.alert('Purchase Failed', error.message || 'An error occurred');
        },
    });

    const handlePurchase = () => {
        setImageError(false);
        const qty = parseInt(quantity);

        if (isNaN(qty) || qty < 1) {
            Alert.alert('Invalid Quantity', 'Please enter a valid number');
            return;
        }

        if (qty > 10) {
            Alert.alert('Limit Exceeded', 'Maximum 10 tickets per purchase');
            return;
        }

        const totalCost = qty * currentPrice;

        if (!profile || profile.wallet_balance < totalCost) {
            Alert.alert(
                'Insufficient Funds',
                `You need ${totalCost} FCFA but only have ${profile?.wallet_balance || 0} FCFA`
            );
            return;
        }

        Alert.alert(
            'Confirm Purchase',
            `Buy ${qty} ${selectedMeal} ticket(s) for ${totalCost} FCFA?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => purchaseMutation.mutate({ mealType: selectedMeal, qty }),
                },
            ]
        );
    };

    const getMealIcon = (mealType: MealType) => {
        switch (mealType) {
            case 'breakfast':
                return 'sunny';
            case 'lunch':
                return 'restaurant';
            case 'dinner':
                return 'moon';
        }
    };

    const getMealTime = (mealType: MealType) => {
        if (!systemSettings?.mealTimes) return '';

        const { start, end } = systemSettings.mealTimes[mealType];

        const formatHour = (h: number) => {
            const period = h >= 12 ? 'PM' : 'AM';
            const hour12 = h % 12 || 12;
            return `${hour12} ${period}`;
        };

        return `${formatHour(start)} - ${formatHour(end)}`;
    };

    const meals: MealType[] = ['breakfast', 'lunch', 'dinner'];

    return (
        <ScrollView
            style={styles(colors).container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
        >
            <View style={styles(colors).walletInfo}>
                <Text style={styles(colors).walletLabel}>Available Balance</Text>
                <Text style={styles(colors).walletBalance}>{profile?.wallet_balance || 0} FCFA</Text>
            </View>

            {menuImage?.image_url && (
                <View style={styles(colors).menuPreview}>
                    <Text style={styles(colors).menuTitle}>
                        {menuImage.isDaily
                            ? "Daily Menu Overview"
                            : `Today's ${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}`
                        }
                    </Text>
                    {imageError ? (
                        <View style={[styles(colors).menuImage, styles(colors).errorContainer]}>
                            <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
                            <Text style={styles(colors).errorText}>Could not load image</Text>
                        </View>
                    ) : (
                        <Image
                            source={{ uri: menuImage.image_url }}
                            style={styles(colors).menuImage}
                            resizeMode="cover"
                            onError={() => setImageError(true)}
                        />
                    )}
                </View>
            )}

            <View style={styles(colors).section}>
                <Text style={styles(colors).sectionTitle}>Select Meal Type</Text>
                {meals.map((meal) => (
                    <TouchableOpacity
                        key={meal}
                        style={[
                            styles(colors).mealCard,
                            selectedMeal === meal && styles(colors).mealCardSelected,
                        ]}
                        onPress={() => setSelectedMeal(meal)}
                    >
                        <View style={styles(colors).mealInfo}>
                            <Ionicons
                                name={getMealIcon(meal)}
                                size={32}
                                color={selectedMeal === meal ? colors.primary : colors.textSecondary}
                            />
                            <View style={styles(colors).mealText}>
                                <Text
                                    style={[
                                        styles(colors).mealName,
                                        selectedMeal === meal && styles(colors).mealNameSelected,
                                    ]}
                                >
                                    {meal.charAt(0).toUpperCase() + meal.slice(1)} ({systemSettings?.mealPrices?.[meal] || 0} FCFA)
                                </Text>
                                <Text style={styles(colors).mealTime}>{getMealTime(meal)}</Text>
                            </View>
                        </View>
                        {selectedMeal === meal && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles(colors).section}>
                <Text style={styles(colors).sectionTitle}>Quantity</Text>
                <View style={styles(colors).quantityContainer}>
                    <TouchableOpacity
                        style={styles(colors).quantityButton}
                        onPress={() => {
                            const current = parseInt(quantity) || 1;
                            if (current > 1) setQuantity(String(current - 1));
                        }}
                    >
                        <Ionicons name="remove" size={24} color={colors.primary} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles(colors).quantityInput}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholderTextColor={colors.textSecondary}
                    />

                    <TouchableOpacity
                        style={styles(colors).quantityButton}
                        onPress={() => {
                            const current = parseInt(quantity) || 1;
                            if (current < 10) setQuantity(String(current + 1));
                        }}
                    >
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
                <Text style={styles(colors).hint}>Maximum 10 tickets per purchase</Text>
            </View>

            <View style={styles(colors).summary}>
                <View style={styles(colors).summaryRow}>
                    <Text style={styles(colors).summaryLabel}>Price per ticket:</Text>
                    <Text style={styles(colors).summaryValue}>{currentPrice} FCFA</Text>
                </View>
                <View style={styles(colors).summaryRow}>
                    <Text style={styles(colors).summaryLabel}>Quantity:</Text>
                    <Text style={styles(colors).summaryValue}>{quantity}</Text>
                </View>
                <View style={[styles(colors).summaryRow, styles(colors).totalRow]}>
                    <Text style={styles(colors).totalLabel}>Total:</Text>
                    <Text style={styles(colors).totalValue}>
                        {(parseInt(quantity) || 0) * currentPrice} FCFA
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={[
                    styles(colors).purchaseButton,
                    purchaseMutation.isPending && styles(colors).purchaseButtonDisabled,
                ]}
                onPress={handlePurchase}
                disabled={purchaseMutation.isPending}
            >
                {purchaseMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles(colors).purchaseButtonText}>Purchase Tickets</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    walletInfo: {
        backgroundColor: colors.primary,
        padding: 20,
        alignItems: 'center',
    },
    walletLabel: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.9,
    },
    walletBalance: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 5,
    },
    menuPreview: {
        backgroundColor: colors.card,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        padding: 12,
        backgroundColor: colors.background,
        textAlign: 'center',
    },
    menuImage: {
        width: '100%',
        height: 200,
        backgroundColor: colors.border,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorText: {
        color: colors.textSecondary,
        marginTop: 8,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: colors.text,
    },
    mealCard: {
        backgroundColor: colors.card,
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    mealCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.background,
    },
    mealInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mealText: {
        marginLeft: 15,
    },
    mealName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    mealNameSelected: {
        color: colors.primary,
    },
    mealTime: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quantityButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quantityInput: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal: 30,
        minWidth: 60,
        color: colors.text,
    },
    hint: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 10,
    },
    summary: {
        backgroundColor: colors.card,
        margin: 20,
        marginTop: 0,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 10,
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    purchaseButton: {
        backgroundColor: colors.primary,
        margin: 20,
        marginTop: 0,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    purchaseButtonDisabled: {
        opacity: 0.6,
    },
    purchaseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
