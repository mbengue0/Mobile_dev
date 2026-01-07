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
import { useTheme } from '../../providers/ThemeProvider';

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
    const { colors } = useTheme();

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
                return colors.success;
            case 'used':
                return colors.textSecondary;
            case 'expired':
                return colors.danger;
            default:
                return colors.textSecondary;
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
        <View style={styles(colors).ticketCard}>
            <View style={styles(colors).ticketHeader}>
                <View style={styles(colors).ticketInfo}>
                    <View style={styles(colors).mealTypeRow}>
                        <Ionicons
                            name={getMealIcon(item.meal_type)}
                            size={20}
                            color={colors.primary}
                        />
                        <Text style={styles(colors).mealType}>
                            {item.meal_type.charAt(0).toUpperCase() + item.meal_type.slice(1)}
                        </Text>
                    </View>
                    <Text style={styles(colors).ticketNumber}>{item.ticket_number}</Text>
                    <Text style={styles(colors).date}>
                        {new Date(item.meal_date).toLocaleDateString()}
                    </Text>
                </View>
                <View
                    style={[
                        styles(colors).statusBadge,
                        { backgroundColor: getStatusColor(item.status) },
                    ]}
                >
                    <Text style={styles(colors).statusText}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            {item.status === 'active' && (
                <View style={styles(colors).qrContainer}>
                    {visibleQR === item.id ? (
                        <TouchableOpacity onPress={() => toggleQR(item.id)}>
                            <View style={styles(colors).qrWrapper}>
                                <QRCode value={item.qr_code_data} size={150} backgroundColor="white" />
                            </View>
                            <Text style={styles(colors).qrHint}>Tap to hide</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles(colors).showQrButton}
                            onPress={() => toggleQR(item.id)}
                        >
                            <Ionicons name="qr-code" size={24} color={colors.primary} />
                            <Text style={styles(colors).showQrText}>Show QR Code</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {item.status === 'used' && item.used_at && (
                <Text style={styles(colors).usedText}>
                    Used on {new Date(item.used_at).toLocaleString()}
                </Text>
            )}

            <Text style={styles(colors).price}>{item.price} FCFA</Text>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles(colors).centerContainer}>
                <Text style={{ color: colors.text }}>Loading tickets...</Text>
            </View>
        );
    }

    if (!tickets || tickets.length === 0) {
        return (
            <View style={styles(colors).centerContainer}>
                <Ionicons name="ticket-outline" size={64} color={colors.textSecondary} />
                <Text style={styles(colors).emptyText}>No tickets yet</Text>
                <Text style={styles(colors).emptySubtext}>
                    Purchase tickets from the Buy Tickets tab
                </Text>
            </View>
        );
    }

    return (
        <View style={styles(colors).container}>
            <FlatList
                data={tickets}
                renderItem={renderTicket}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles(colors).listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
                }
            />
        </View>
    );
}

const styles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: 15,
    },
    ticketCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
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
        color: colors.text,
    },
    ticketNumber: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 3,
    },
    date: {
        fontSize: 14,
        color: colors.textSecondary,
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
        borderTopColor: colors.border,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: 15,
        minHeight: 150,
        justifyContent: 'center',
    },
    qrWrapper: {
        padding: 10,
        backgroundColor: '#fff', // QR needs high contrast
        borderRadius: 8,
    },
    qrHint: {
        marginTop: 10,
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    showQrButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: colors.background,
        borderRadius: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
    },
    showQrText: {
        marginTop: 8,
        color: colors.primary,
        fontWeight: '600',
    },
    usedText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: 10,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'right',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 5,
        textAlign: 'center',
    },
});
