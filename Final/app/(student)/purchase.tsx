import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
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

interface CartState {
    breakfast: number;
    lunch: number;
    dinner: number;
}

import { useTranslation } from 'react-i18next';

export default function PurchaseScreen() {
    const { t } = useTranslation();
    const { user, profile, refreshProfile } = useAuth();
    const [cart, setCart] = useState<CartState>({ breakfast: 0, lunch: 0, dinner: 0 });
    const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch');
    const [imageError, setImageError] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const { sendNotification } = useNotifications();
    const { colors } = useTheme();

    // Fetch dynamic system settings
    const { data: systemSettings, isLoading: settingsLoading } = useSystemSettings();

    const { data: menuImage, refetch: refetchMenu } = useQuery({
        queryKey: ['menu_image', selectedMeal],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];

            // 1. Try Daily Overview first (applies to all meals)
            const { data: dailyOverview } = await supabase
                .from('menu_images')
                .select('image_url, menu_date, meal_type')
                .eq('meal_type', 'daily_overview')
                .eq('menu_date', today)
                .single();

            if (dailyOverview) return { ...dailyOverview, isDaily: true };

            // 2. Try specific meal image
            const { data: specificMeal } = await supabase
                .from('menu_images')
                .select('image_url, menu_date, meal_type')
                .eq('meal_type', selectedMeal)
                .eq('menu_date', today)
                .single();

            if (specificMeal) return { ...specificMeal, isDaily: false };

            // 3. Fallback: Most recent for this meal
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
        mutationFn: async (items: Array<{ type: MealType; quantity: number; price: number; date: string }>) => {
            const { data, error } = await supabase.rpc('purchase_tickets_bulk', {
                p_student_id: user?.id,
                p_items: items,
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tickets', user?.id] });
            refreshProfile();

            // Calculate total items
            const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

            // Send notification
            sendNotification(
                t('purchase.successTitle'),
                t('purchase.successMsg', { count: totalItems }),
                'ticket_purchase',
                { cart }
            );

            Alert.alert(
                t('purchase.successTitle'),
                t('purchase.successMsg', { count: totalItems }),
                [
                    {
                        text: t('purchase.viewTickets'),
                        onPress: () => router.push('/(student)/tickets'),
                    },
                    { text: t('common.confirm') },
                ]
            );

            // Clear cart
            setCart({ breakfast: 0, lunch: 0, dinner: 0 });
        },
        onError: (error: any) => {
            Alert.alert(t('purchase.purchaseFailed'), error.message || t('common.error'));
        },
    });

    const handleCheckout = () => {
        setImageError(false);

        // Build items array
        const items = (Object.keys(cart) as MealType[])
            .filter(mealType => cart[mealType] > 0)
            .map(mealType => ({
                type: mealType,
                quantity: cart[mealType],
                price: systemSettings?.mealPrices?.[mealType] || 0,
                date: new Date().toISOString().split('T')[0],
            }));

        if (items.length === 0) {
            Alert.alert(t('purchase.emptyCart'), t('purchase.emptyCartMsg'));
            return;
        }

        const totalCost = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

        if (!profile || profile.wallet_balance < totalCost) {
            Alert.alert(
                t('purchase.insufficientFunds'),
                t('purchase.insufficientFundsMsg', { total: totalCost, balance: profile?.wallet_balance || 0 })
            );
            return;
        }

        // Build summary for confirmation
        const summary = items.map(item => `${item.quantity} ${t(`meals.${item.type}`)}`).join(', ');

        Alert.alert(
            t('purchase.confirmPurchase'),
            t('purchase.purchaseDesc', { summary, total: totalCost }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.confirm'),
                    onPress: () => purchaseMutation.mutate(items),
                },
            ]
        );
    };

    const updateCart = (mealType: MealType, delta: number) => {
        setCart(prev => {
            const newQty = Math.max(0, Math.min(10, prev[mealType] + delta));
            return { ...prev, [mealType]: newQty };
        });
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

    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const totalCost = meals.reduce((sum, meal) =>
        sum + (cart[meal] * (systemSettings?.mealPrices?.[meal] || 0)), 0
    );

    return (
        <View style={styles(colors).container}>
            <ScrollView
                style={styles(colors).scrollView}
                contentContainerStyle={styles(colors).scrollContent}
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
                            {menuImage.isDaily ? t('meals.dailyOverview') : t('purchase.menuPreview')}
                        </Text>
                        {imageError ? (
                            <View style={[styles(colors).menuImage, styles(colors).errorContainer]}>
                                <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
                                <Text style={styles(colors).errorText}>{t('common.error')}</Text>
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
                    <Text style={styles(colors).sectionTitle}>{t('purchase.selectMeals')}</Text>
                    <Text style={styles(colors).subtitle}>{t('purchase.addToCart')}</Text>

                    {meals.map((meal) => (
                        <View
                            key={meal}
                            style={[
                                styles(colors).mealCard,
                                cart[meal] > 0 && styles(colors).mealCardActive,
                                selectedMeal === meal && styles(colors).mealCardSelected,
                            ]}
                        >
                            <TouchableOpacity
                                style={styles(colors).mealInfo}
                                onPress={() => setSelectedMeal(meal)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={getMealIcon(meal)}
                                    size={32}
                                    color={cart[meal] > 0 ? colors.primary : colors.textSecondary}
                                />
                                <View style={styles(colors).mealText}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text
                                            style={[
                                                styles(colors).mealName,
                                                cart[meal] > 0 && styles(colors).mealNameActive,
                                            ]}
                                        >
                                            {t(`meals.${meal}`)}
                                        </Text>
                                        <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
                                    </View>
                                    <Text style={styles(colors).mealTime}>{getMealTime(meal)}</Text>
                                    <Text style={styles(colors).mealPrice}>
                                        {systemSettings?.mealPrices?.[meal] || 0} FCFA
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles(colors).stepperContainer}>
                                <TouchableOpacity
                                    style={styles(colors).stepperButton}
                                    onPress={() => updateCart(meal, -1)}
                                    disabled={cart[meal] === 0}
                                >
                                    <Ionicons
                                        name="remove"
                                        size={20}
                                        color={cart[meal] === 0 ? colors.textSecondary : colors.primary}
                                    />
                                </TouchableOpacity>

                                <Text style={styles(colors).stepperValue}>{cart[meal]}</Text>

                                <TouchableOpacity
                                    style={styles(colors).stepperButton}
                                    onPress={() => updateCart(meal, 1)}
                                    disabled={cart[meal] >= 10}
                                >
                                    <Ionicons
                                        name="add"
                                        size={20}
                                        color={cart[meal] >= 10 ? colors.textSecondary : colors.primary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <Text style={styles(colors).hint}>{t('purchase.maxLimit')}</Text>
                </View>

                {/* Spacer for floating footer */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Checkout Footer */}
            {totalItems > 0 && (
                <View style={styles(colors).floatingFooter}>
                    <View style={styles(colors).footerInfo}>
                        <Text style={styles(colors).footerItems}>
                            {totalItems} {t('purchase.items')}
                        </Text>
                        <Text style={styles(colors).footerTotal}>{totalCost} FCFA</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles(colors).checkoutButton,
                            purchaseMutation.isPending && styles(colors).checkoutButtonDisabled,
                        ]}
                        onPress={handleCheckout}
                        disabled={purchaseMutation.isPending}
                    >
                        {purchaseMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles(colors).checkoutButtonText}>{t('purchase.checkout')}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
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
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 5,
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 15,
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
    mealCardActive: {
        borderColor: colors.primary,
        backgroundColor: colors.background,
    },
    mealCardSelected: {
        borderColor: colors.primary,
        borderWidth: 3,
        backgroundColor: colors.background,
    },
    mealInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    mealText: {
        marginLeft: 15,
        flex: 1,
    },
    mealName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    mealNameActive: {
        color: colors.primary,
    },
    mealTime: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    mealPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginTop: 4,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    stepperButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
    stepperValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginHorizontal: 12,
        minWidth: 30,
        textAlign: 'center',
    },
    hint: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 10,
    },
    floatingFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    footerInfo: {
        flex: 1,
    },
    footerItems: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    footerTotal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    checkoutButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 140,
        justifyContent: 'center',
    },
    checkoutButtonDisabled: {
        opacity: 0.6,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
