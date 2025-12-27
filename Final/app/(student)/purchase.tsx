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

    // Fetch dynamic system settings (prices and times)
    const { data: systemSettings, isLoading: settingsLoading } = useQuery({
        queryKey: ['system_settings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .in('setting_key', ['meal_prices', 'meal_times']);

            if (error) {
                console.error('Error fetching settings:', error);
                // Fallback defaults
                return {
                    mealPrices: { breakfast: 500, lunch: 1000, dinner: 800 } as MealPrices,
                    mealTimes: {
                        breakfast: { start: 7, end: 11 },
                        lunch: { start: 12, end: 15 },
                        dinner: { start: 19, end: 22 },
                    } as MealTimes,
                };
            }

            const mealPrices = data?.find(s => s.setting_key === 'meal_prices')?.setting_value as MealPrices;
            const mealTimes = data?.find(s => s.setting_key === 'meal_times')?.setting_value as MealTimes;

            return {
                mealPrices: mealPrices || { breakfast: 500, lunch: 1000, dinner: 800 },
                mealTimes: mealTimes || {
                    breakfast: { start: 7, end: 11 },
                    lunch: { start: 12, end: 15 },
                    dinner: { start: 19, end: 22 },
                },
            };
        },
    });

    const currentPrice = systemSettings?.mealPrices?.[selectedMeal] || 0;

    const { data: menuImage, refetch: refetchMenu } = useQuery({
        queryKey: ['menu_image', selectedMeal],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];

            // Try to get today's menu first
            const { data: todayMenu, error: todayError } = await supabase
                .from('menu_images')
                .select('image_url, menu_date')
                .eq('meal_type', selectedMeal)
                .eq('menu_date', today)
                .single();

            // If today's menu exists, return it
            if (todayMenu) return todayMenu;

            // Otherwise, get the most recent menu (fallback to yesterday or recent days)
            const { data: recentMenu } = await supabase
                .from('menu_images')
                .select('image_url, menu_date')
                .eq('meal_type', selectedMeal)
                .gte('menu_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                .order('menu_date', { ascending: false })
                .limit(1)
                .single();

            return recentMenu || null;
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets', user?.id] });
            refreshProfile();
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
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Available Balance</Text>
                <Text style={styles.walletBalance}>{profile?.wallet_balance || 0} FCFA</Text>
            </View>

            {menuImage?.image_url && (
                <View style={styles.menuPreview}>
                    <Text style={styles.menuTitle}>Today's {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}</Text>
                    {imageError ? (
                        <View style={[styles.menuImage, styles.errorContainer]}>
                            <Ionicons name="image-outline" size={48} color="#999" />
                            <Text style={styles.errorText}>Could not load image</Text>
                        </View>
                    ) : (
                        <Image
                            source={{ uri: menuImage.image_url }}
                            style={styles.menuImage}
                            resizeMode="cover"
                            onError={() => setImageError(true)}
                        />
                    )}
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Meal Type</Text>
                {meals.map((meal) => (
                    <TouchableOpacity
                        key={meal}
                        style={[
                            styles.mealCard,
                            selectedMeal === meal && styles.mealCardSelected,
                        ]}
                        onPress={() => setSelectedMeal(meal)}
                    >
                        <View style={styles.mealInfo}>
                            <Ionicons
                                name={getMealIcon(meal)}
                                size={32}
                                color={selectedMeal === meal ? '#007AFF' : '#666'}
                            />
                            <View style={styles.mealText}>
                                <Text
                                    style={[
                                        styles.mealName,
                                        selectedMeal === meal && styles.mealNameSelected,
                                    ]}
                                >
                                    {meal.charAt(0).toUpperCase() + meal.slice(1)} ({systemSettings?.mealPrices?.[meal] || 0} FCFA)
                                </Text>
                                <Text style={styles.mealTime}>{getMealTime(meal)}</Text>
                            </View>
                        </View>
                        {selectedMeal === meal && (
                            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quantity</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                            const current = parseInt(quantity) || 1;
                            if (current > 1) setQuantity(String(current - 1));
                        }}
                    >
                        <Ionicons name="remove" size={24} color="#007AFF" />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.quantityInput}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="number-pad"
                        maxLength={2}
                    />

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                            const current = parseInt(quantity) || 1;
                            if (current < 10) setQuantity(String(current + 1));
                        }}
                    >
                        <Ionicons name="add" size={24} color="#007AFF" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.hint}>Maximum 10 tickets per purchase</Text>
            </View>

            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Price per ticket:</Text>
                    <Text style={styles.summaryValue}>{currentPrice} FCFA</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Quantity:</Text>
                    <Text style={styles.summaryValue}>{quantity}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                        {(parseInt(quantity) || 0) * currentPrice} FCFA
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={[
                    styles.purchaseButton,
                    purchaseMutation.isPending && styles.purchaseButtonDisabled,
                ]}
                onPress={handlePurchase}
                disabled={purchaseMutation.isPending}
            >
                {purchaseMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.purchaseButtonText}>Purchase Tickets</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    walletInfo: {
        backgroundColor: '#007AFF',
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
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        padding: 12,
        backgroundColor: '#F0F8FF',
        textAlign: 'center',
    },
    menuImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#eee',
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    errorText: {
        color: '#999',
        marginTop: 8,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    mealCard: {
        backgroundColor: '#fff',
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
        borderColor: '#007AFF',
        backgroundColor: '#F0F8FF',
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
        color: '#333',
    },
    mealNameSelected: {
        color: '#007AFF',
    },
    mealTime: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
    },
    quantityButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
    },
    quantityInput: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal: 30,
        minWidth: 60,
    },
    hint: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
    },
    summary: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 0,
        padding: 20,
        borderRadius: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    purchaseButton: {
        backgroundColor: '#007AFF',
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
