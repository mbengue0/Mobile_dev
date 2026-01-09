import { useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';

export interface MealPrices {
    breakfast: number;
    lunch: number;
    dinner: number;
}

export interface MealTimes {
    breakfast: { start: number; end: number };
    lunch: { start: number; end: number };
    dinner: { start: number; end: number };
}

export interface SystemSettings {
    mealPrices: MealPrices;
    mealTimes: MealTimes;
}

export function useSystemSettings() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['system_settings'],
        queryFn: async (): Promise<SystemSettings> => {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .in('setting_key', ['meal_prices', 'meal_times']);

            if (error) {
                console.error('Error fetching settings:', error);
                // Fallback defaults
                return {
                    mealPrices: { breakfast: 500, lunch: 1000, dinner: 800 },
                    mealTimes: {
                        breakfast: { start: 7, end: 11 },
                        lunch: { start: 12, end: 15 },
                        dinner: { start: 19, end: 22 },
                    },
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

    // Auto-refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            query.refetch();
        }, [query.refetch])
    );

    useEffect(() => {
        const channel = supabase
            .channel('system_settings_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'system_settings'
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['system_settings'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return query;
}
