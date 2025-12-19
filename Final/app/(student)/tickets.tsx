import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';

interface Ticket {
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

export default function TicketsScreen() {
    const { user } = useAuth();

    const { data: tickets, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['tickets', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('student_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Ticket[];
        },
        enabled: !!user,
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#34C759';
            case 'used':
                return '#8E8E93';
            case 'expired':
                return '#FF3B30';
            default:
                return '#8E8E93';
        }
    };

    const getMealIcon = (mealType: string) => {
        switch (mealType) {
            case 'breakfast':
                return 'sunny';
            case 'lunch':
                return 'restaurant';
            case 'dinner':
                return 'moon';
            default:
                return 'fast-food';
        }
    };

    const [visibleQR, setVisibleQR] = React.useState<string | null>(null);

    const toggleQR = (id: string) => {
        if (visibleQR === id) {
            setVisibleQR(null);
        } else {
            setVisibleQR(id);
        }
    };

    const renderTicket = ({ item }: { item: Ticket }) => (
        <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
                <View style={styles.ticketInfo}>
                    <View style={styles.mealTypeRow}>
                        <Ionicons
                            name={getMealIcon(item.meal_type)}
                            size={20}
                            color="#007AFF"
                        />
                        <Text style={styles.mealType}>
                            {item.meal_type.charAt(0).toUpperCase() + item.meal_type.slice(1)}
                        </Text>
                    </View>
                    <Text style={styles.ticketNumber}>{item.ticket_number}</Text>
                    <Text style={styles.date}>
                        {new Date(item.meal_date).toLocaleDateString()}
                    </Text>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) },
                    ]}
                >
                    <Text style={styles.statusText}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            {item.status === 'active' && (
                <View style={styles.qrContainer}>
                    {visibleQR === item.id ? (
                        <TouchableOpacity onPress={() => toggleQR(item.id)}>
                            <QRCode value={item.qr_code_data} size={150} />
                            <Text style={styles.qrHint}>Tap to hide</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.showQrButton}
                            onPress={() => toggleQR(item.id)}
                        >
                            <Ionicons name="qr-code" size={24} color="#007AFF" />
                            <Text style={styles.showQrText}>Show QR Code</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {item.status === 'used' && item.used_at && (
                <Text style={styles.usedText}>
                    Used on {new Date(item.used_at).toLocaleString()}
                </Text>
            )}

            <Text style={styles.price}>{item.price} FCFA</Text>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <Text>Loading tickets...</Text>
            </View>
        );
    }

    if (!tickets || tickets.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="ticket-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No tickets yet</Text>
                <Text style={styles.emptySubtext}>
                    Purchase tickets from the Buy Tickets tab
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={tickets}
                renderItem={renderTicket}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
            />
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
        padding: 20,
    },
    listContent: {
        padding: 15,
    },
    ticketCard: {
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
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    ticketInfo: {
        flex: 1,
    },
    mealTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    mealType: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
        color: '#333',
    },
    ticketNumber: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    qrContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 15,
        minHeight: 150,
        justifyContent: 'center',
    },
    qrHint: {
        marginTop: 10,
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    showQrButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F0F8FF',
        borderRadius: 12,
        width: '100%',
    },
    showQrText: {
        marginTop: 8,
        color: '#007AFF',
        fontWeight: '600',
    },
    usedText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 10,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        textAlign: 'right',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
    },
});
