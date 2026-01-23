import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface MealTimes {
    breakfast: { start: number; end: number };
    lunch: { start: number; end: number };
    dinner: { start: number; end: number };
}

interface MealPrices {
    breakfast: number;
    lunch: number;
    dinner: number;
}

import { setLanguage } from '../../lib/i18n';

export default function SystemSettingsScreen() {
    const { t, i18n } = useTranslation();
    // Using hardcoded colors for consistency with original file structure
    // Line 17: import { useTranslation } from 'react-i18next';
    // Line 16: import { Ionicons } from '@expo/vector-icons';
    const queryClient = useQueryClient();

    // Fetch current settings
    const { data: settings, isLoading, error } = useQuery({
        queryKey: ['system_settings'],
        queryFn: async () => {
            console.log('Fetching system settings...');
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .in('setting_key', ['meal_times', 'meal_prices']);

            console.log('Settings query result:', { data, error });

            if (error) {
                console.error('Settings query error:', error);
                throw error;
            }

            const mealTimes = data?.find(s => s.setting_key === 'meal_times')?.setting_value as MealTimes;
            const mealPrices = data?.find(s => s.setting_key === 'meal_prices')?.setting_value as MealPrices;

            console.log('Parsed settings:', { mealTimes, mealPrices });

            // Return defaults if data not found
            return {
                mealTimes: mealTimes || {
                    breakfast: { start: 7, end: 11 },
                    lunch: { start: 12, end: 15 },
                    dinner: { start: 19, end: 22 },
                },
                mealPrices: mealPrices || {
                    breakfast: 500,
                    lunch: 1000,
                    dinner: 800,
                },
            };
        },
    });

    // Local state for editing
    const [mealTimes, setMealTimes] = useState<MealTimes | null>(null);
    const [mealPrices, setMealPrices] = useState<MealPrices | null>(null);

    // Save mutation - MUST be declared before any conditional returns
    const saveMutation = useMutation({
        mutationFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();

            const updates = [
                {
                    setting_key: 'meal_times',
                    setting_value: mealTimes,
                    updated_by: user?.id,
                    updated_at: new Date().toISOString(),
                },
                {
                    setting_key: 'meal_prices',
                    setting_value: mealPrices,
                    updated_by: user?.id,
                    updated_at: new Date().toISOString(),
                },
            ];

            for (const update of updates) {
                const { error } = await supabase
                    .from('system_settings')
                    .update(update)
                    .eq('setting_key', update.setting_key);

                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system_settings'] });
            Alert.alert(t('common.success'), t('admin.system.success'));
        },
        onError: (error: any) => {
            Alert.alert(t('common.error'), error.message);
        },
    });

    // Initialize local state when data loads
    React.useEffect(() => {
        console.log('Settings data changed:', settings);
        if (settings) {
            setMealTimes(settings.mealTimes);
            setMealPrices(settings.mealPrices);
        }
    }, [settings]);

    // NOW we can do conditional returns - all hooks have been called

    // Show error if query failed
    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="alert-circle" size={64} color="#FF3B30" />
                <Text style={styles.loadingText}>Error loading settings</Text>
                <Text style={styles.errorText}>{(error as Error).message}</Text>
            </View>
        );
    }

    const handleSave = () => {
        // Validation
        if (!mealTimes || !mealPrices) {
            Alert.alert(t('common.error'), t('admin.system.fillAll'));
            return;
        }

        // Validate time windows
        const meals = ['breakfast', 'lunch', 'dinner'] as const;
        for (const meal of meals) {
            const { start, end } = mealTimes[meal];
            if (start >= end) {
                Alert.alert(t('common.error'), t('admin.system.timeError', { meal: t(`meals.${meal}`) }));
                return;
            }
            if (start < 0 || start > 23 || end < 0 || end > 23) {
                Alert.alert(t('common.error'), t('admin.system.hoursError'));
                return;
            }
            if (mealPrices[meal] <= 0) {
                Alert.alert(t('common.error'), t('admin.system.priceError', { meal: t(`meals.${meal}`) }));
                return;
            }
        }

        saveMutation.mutate();
    };

    const handleReset = () => {
        Alert.alert(
            t('admin.system.reset'),
            t('admin.system.resetConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('admin.system.reset'),
                    style: 'destructive',
                    onPress: () => {
                        setMealTimes({
                            breakfast: { start: 7, end: 11 },
                            lunch: { start: 12, end: 15 },
                            dinner: { start: 19, end: 22 },
                        });
                        setMealPrices({
                            breakfast: 500,
                            lunch: 1000,
                            dinner: 800,
                        });
                    },
                },
            ]
        );
    };

    if (isLoading || !mealTimes || !mealPrices) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 50 }}
            >
                <View style={styles.header}>
                    <Ionicons name="settings" size={32} color="#007AFF" />
                    <Text style={styles.headerTitle}>{t('admin.system.title')}</Text>
                    <Text style={styles.headerSubtitle}>{t('admin.system.subtitle')}</Text>
                </View>

                {/* Local Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.title')}</Text>
                    <View style={styles.mealCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="language" size={24} color="#007AFF" />
                                <Text style={styles.mealName}>{t('settings.language')}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setLanguage(i18n.language === 'en' ? 'fr' : 'en')}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#f9f9f9',
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: '#ddd'
                                }}
                            >
                                <Text style={{ color: '#333', fontWeight: 'bold', marginRight: 5 }}>
                                    {i18n.language === 'en' ? 'English' : 'Français'}
                                </Text>
                                <Ionicons name="repeat" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Meal Times Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('admin.system.mealTimes')}</Text>

                    {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                        <View key={meal} style={styles.mealCard}>
                            <View style={styles.mealHeader}>
                                <Ionicons
                                    name={meal === 'breakfast' ? 'sunny' : meal === 'lunch' ? 'restaurant' : 'moon'}
                                    size={24}
                                    color="#007AFF"
                                />
                                <Text style={styles.mealName}>
                                    {t(`meals.${meal}`)}
                                </Text>
                            </View>

                            <View style={styles.timeInputs}>
                                <View style={styles.timeInput}>
                                    <Text style={styles.inputLabel}>{t('admin.system.start')}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={mealTimes[meal].start.toString()}
                                        onChangeText={(text) => {
                                            const value = parseInt(text) || 0;
                                            setMealTimes({
                                                ...mealTimes,
                                                [meal]: { ...mealTimes[meal], start: value },
                                            });
                                        }}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                </View>

                                <Text style={styles.timeSeparator}>to</Text>

                                <View style={styles.timeInput}>
                                    <Text style={styles.inputLabel}>{t('admin.system.end')}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={mealTimes[meal].end.toString()}
                                        onChangeText={(text) => {
                                            const value = parseInt(text) || 0;
                                            setMealTimes({
                                                ...mealTimes,
                                                [meal]: { ...mealTimes[meal], end: value },
                                            });
                                        }}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Meal Prices Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('admin.system.mealPrices')}</Text>

                    {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                        <View key={meal} style={styles.priceCard}>
                            <View style={styles.priceHeader}>
                                <Ionicons
                                    name={meal === 'breakfast' ? 'sunny' : meal === 'lunch' ? 'restaurant' : 'moon'}
                                    size={20}
                                    color="#007AFF"
                                />
                                <Text style={styles.priceMealName}>
                                    {t(`meals.${meal}`)}
                                </Text>
                            </View>

                            <TextInput
                                style={styles.priceInput}
                                value={mealPrices[meal].toString()}
                                onChangeText={(text) => {
                                    const value = parseInt(text) || 0;
                                    setMealPrices({
                                        ...mealPrices,
                                        [meal]: value,
                                    });
                                }}
                                keyboardType="number-pad"
                                placeholder="0"
                            />
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleReset}
                    >
                        <Ionicons name="refresh" size={20} color="#FF3B30" />
                        <Text style={styles.resetButtonText}>{t('admin.system.reset')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveButton, saveMutation.isPending && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={saveMutation.isPending}
                    >
                        {saveMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.saveButtonText}>{t('admin.system.save')}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        marginTop: 10,
        fontSize: 14,
        color: '#FF3B30',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    mealCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    mealName: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
        color: '#333',
    },
    timeInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeInput: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlign: 'center',
    },
    timeSeparator: {
        fontSize: 16,
        color: '#666',
        marginHorizontal: 15,
    },
    priceCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    priceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    priceMealName: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 10,
        color: '#333',
    },
    priceInput: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlign: 'center',
        width: 120,
    },
    actions: {
        padding: 15,
        paddingBottom: 30,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FF3B30',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    resetButtonText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 15,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
