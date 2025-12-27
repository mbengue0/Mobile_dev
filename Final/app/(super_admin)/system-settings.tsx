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

export default function SystemSettingsScreen() {
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
            Alert.alert('Success', 'Settings updated successfully!');
        },
        onError: (error: any) => {
            Alert.alert('Error', error.message);
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
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Validate time windows
        const meals = ['breakfast', 'lunch', 'dinner'] as const;
        for (const meal of meals) {
            const { start, end } = mealTimes[meal];
            if (start >= end) {
                Alert.alert('Error', `${meal} start time must be before end time`);
                return;
            }
            if (start < 0 || start > 23 || end < 0 || end > 23) {
                Alert.alert('Error', 'Hours must be between 0 and 23');
                return;
            }
            if (mealPrices[meal] <= 0) {
                Alert.alert('Error', `${meal} price must be greater than 0`);
                return;
            }
        }

        saveMutation.mutate();
    };

    const handleReset = () => {
        Alert.alert(
            'Reset to Defaults',
            'Are you sure you want to reset all settings to default values?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
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
                <Text style={styles.loadingText}>Loading settings...</Text>
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
                    <Text style={styles.headerTitle}>System Settings</Text>
                    <Text style={styles.headerSubtitle}>Configure meal times and prices</Text>
                </View>

                {/* Meal Times Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⏰ Meal Time Windows (24h format)</Text>

                    {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                        <View key={meal} style={styles.mealCard}>
                            <View style={styles.mealHeader}>
                                <Ionicons
                                    name={meal === 'breakfast' ? 'sunny' : meal === 'lunch' ? 'restaurant' : 'moon'}
                                    size={24}
                                    color="#007AFF"
                                />
                                <Text style={styles.mealName}>
                                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                </Text>
                            </View>

                            <View style={styles.timeInputs}>
                                <View style={styles.timeInput}>
                                    <Text style={styles.inputLabel}>Start Hour</Text>
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
                                    <Text style={styles.inputLabel}>End Hour</Text>
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
                    <Text style={styles.sectionTitle}>💰 Meal Prices (FCFA)</Text>

                    {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                        <View key={meal} style={styles.priceCard}>
                            <View style={styles.priceHeader}>
                                <Ionicons
                                    name={meal === 'breakfast' ? 'sunny' : meal === 'lunch' ? 'restaurant' : 'moon'}
                                    size={20}
                                    color="#007AFF"
                                />
                                <Text style={styles.priceMealName}>
                                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
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
                        <Text style={styles.resetButtonText}>Reset to Defaults</Text>
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
                                <Text style={styles.saveButtonText}>Save Changes</Text>
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
