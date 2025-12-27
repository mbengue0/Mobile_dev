import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface User {
    id: string;
    email: string;
    full_name: string;
    student_id: string;
    role: 'student' | 'admin' | 'super_admin';
    wallet_balance: number;
}

export default function UsersScreen() {
    const { signOut } = useAuth();
    const [filter, setFilter] = useState<'all' | 'student' | 'admin'>('all');
    const queryClient = useQueryClient();

    const { data: users, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['users', filter],
        queryFn: async () => {
            let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

            if (filter === 'student') {
                query = query.eq('role', 'student');
            } else if (filter === 'admin') {
                query = query.in('role', ['admin', 'super_admin']);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as User[];
        },
    });

    const promoteMutation = useMutation({
        mutationFn: async (userId: string) => {
            const { data, error } = await supabase.rpc('promote_user', {
                target_user_id: userId,
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            Alert.alert('Success', 'User promoted to admin');
        },
        onError: (error: any) => {
            Alert.alert('Error', error.message);
        },
    });

    const handlePromote = (user: User) => {
        Alert.alert(
            'Promote User',
            `Promote ${user.full_name} to Admin?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Promote',
                    style: 'destructive',
                    onPress: () => promoteMutation.mutate(user.id),
                },
            ]
        );
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'super_admin':
                return '#5856D6';
            case 'admin':
                return '#FF9500';
            default:
                return '#34C759';
        }
    };

    const renderUser = ({ item }: { item: User }) => (
        <View style={styles.userCard}>
            <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.full_name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <Text style={styles.userDetail}>ID: {item.student_id}</Text>
                    <Text style={styles.userDetail}>
                        Balance: {item.wallet_balance} FCFA
                    </Text>
                </View>
                <View
                    style={[
                        styles.roleBadge,
                        { backgroundColor: getRoleBadgeColor(item.role) },
                    ]}
                >
                    <Text style={styles.roleText}>
                        {item.role.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>
            </View>

            {item.role === 'student' && (
                <TouchableOpacity
                    style={styles.promoteButton}
                    onPress={() => handlePromote(item)}
                    disabled={promoteMutation.isPending}
                >
                    {promoteMutation.isPending ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Ionicons name="arrow-up-circle" size={20} color="#fff" />
                            <Text style={styles.promoteButtonText}>Promote to Staff</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#5856D6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'student' && styles.filterButtonActive]}
                    onPress={() => setFilter('student')}
                >
                    <Text style={[styles.filterText, filter === 'student' && styles.filterTextActive]}>
                        Students
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'admin' && styles.filterButtonActive]}
                    onPress={() => setFilter('admin')}
                >
                    <Text style={[styles.filterText, filter === 'admin' && styles.filterTextActive]}>
                        Staff
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={users}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No users found</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => router.push('/(super_admin)/system-settings')}
            >
                <Ionicons name="settings" size={20} color="#fff" />
                <Text style={styles.settingsText}>System Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
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
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 15,
        gap: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterButton: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    filterButtonActive: {
        backgroundColor: '#5856D6',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 15,
    },
    userCard: {
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
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    userDetail: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    roleText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    promoteButton: {
        backgroundColor: '#5856D6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        gap: 8,
    },
    promoteButtonText: {
        color: '#fff',
        fontSize: 14,
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
    settingsButton: {
        backgroundColor: '#5856D6',
        margin: 15,
        marginBottom: 0,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    settingsText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        margin: 15,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
