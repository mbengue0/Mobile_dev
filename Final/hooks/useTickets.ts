import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export interface Ticket {
    id: string;
    ticket_number: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner';
    meal_date: string;
    price: number;
    status: 'active' | 'used' | 'expired';
    qr_code_data: string;
    created_at: string;
    used_at: string | null;
}

export function useTickets() {
    const { user } = useAuth();

    const query = useQuery({
        queryKey: ['tickets', user?.id],
        queryFn: async () => {
            if (!user) return { active: [], history: [] };

            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('student_id', user.id);

            if (error) throw error;

            const tickets = data as Ticket[];

            // Smart Sort Logic
            const mealPriority = { breakfast: 1, lunch: 2, dinner: 3 };

            const active = tickets
                .filter(t => t.status === 'active')
                .sort((a, b) => {
                    // 1. Primary Sort: Meal Type (Breakfast -> Lunch -> Dinner)
                    const priorityA = mealPriority[a.meal_type] || 99;
                    const priorityB = mealPriority[b.meal_type] || 99;
                    if (priorityA !== priorityB) return priorityA - priorityB;

                    // 2. Secondary Sort: Created At (Oldest First)
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                });

            const history = tickets
                .filter(t => t.status !== 'active')
                .sort((a, b) => {
                    // Sort by used_at if available, otherwise created_at, descending (newest first)
                    const dateA = a.used_at ? new Date(a.used_at).getTime() : new Date(a.created_at).getTime();
                    const dateB = b.used_at ? new Date(b.used_at).getTime() : new Date(b.created_at).getTime();
                    return dateB - dateA;
                });

            return {
                active,
                history
            };
        },
        enabled: !!user,
    });

    // Realtime Subscription
    React.useEffect(() => {
        if (!user) return;

        const subscription = supabase
            .channel('tickets_channel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tickets',
                    filter: `student_id=eq.${user.id}`,
                },
                () => {
                    query.refetch();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user, query.refetch]);

    return query;
}
