import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useTickets, Ticket } from '../../hooks/useTickets';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

// --- Sub-Components ---

const ActiveTicketCard = React.memo(({ item, colors }: { item: Ticket; colors: any }) => {
    const getMealColor = (mealType: string): [string, string, ...string[]] => {
        switch (mealType) {
            case 'breakfast':
                return ['#F39C12', '#F1C40F'];
            case 'lunch':
                return ['#2980B9', '#3498DB'];
            case 'dinner':
                return ['#8E44AD', '#9B59B6'];
            default:
                return ['#34495E', '#2C3E50'];
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <View style={{ width: width, alignItems: 'center', justifyContent: 'center' }}>
            <LinearGradient
                colors={getMealColor(item.meal_type)}
                style={styles(colors).activeCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles(colors).cardHeader}>
                    <Text style={styles(colors).cardTitle}>
                        {item.meal_type.toUpperCase()}
                    </Text>
                    <Ionicons name="restaurant" size={24} color="rgba(255,255,255,0.8)" />
                </View>

                <View style={styles(colors).qrContainer}>
                    <View style={styles(colors).qrBackground}>
                        <QRCode value={item.qr_code_data} size={180} backgroundColor="white" />
                    </View>
                </View>

                <View style={styles(colors).cardFooter}>
                    <Text style={styles(colors).ticketId}>Ticket #{item.ticket_number}</Text>
                    <Text style={styles(colors).priceTag}>{item.price} FCFA</Text>
                </View>

                <Text style={styles(colors).dateText}>
                    {formatDate(item.meal_date)}
                </Text>
            </LinearGradient>
        </View>
    );
});

const HistoryTicketRow = React.memo(({ item, colors }: { item: Ticket; colors: any }) => (
    <View style={styles(colors).historyCard}>
        <View style={styles(colors).historyIcon}>
            <Ionicons
                name={item.status === 'used' ? "checkmark-circle" : "alert-circle"}
                size={24}
                color={item.status === 'used' ? colors.textSecondary : colors.danger}
            />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles(colors).historyTitle}>
                {item.meal_type.charAt(0).toUpperCase() + item.meal_type.slice(1)}
            </Text>
            <Text style={styles(colors).historyDate}>
                {item.status === 'used' && item.used_at
                    ? `Used: ${new Date(item.used_at).toLocaleDateString()}`
                    : `Expired: ${new Date(item.meal_date).toLocaleDateString()}`
                }
            </Text>
        </View>
        <View style={styles(colors).badge}>
            <Text style={styles(colors).badgeText}>{item.status.toUpperCase()}</Text>
        </View>
    </View>
));

// --- Main Screen ---

export default function TicketsScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { data, isLoading, refetch, isRefetching } = useTickets();
    const [viewMode, setViewMode] = useState<'active' | 'history'>('active');

    return (
        <View style={styles(colors).container}>
            {/* Header / Segmented Control */}
            <View style={[styles(colors).headerContainer, { paddingTop: insets.top + 10 }]}>
                <View style={styles(colors).segmentedControl}>
                    <TouchableOpacity
                        style={[styles(colors).segmentBtn, viewMode === 'active' && styles(colors).segmentBtnActive]}
                        onPress={() => setViewMode('active')}
                    >
                        <Text style={[styles(colors).segmentText, viewMode === 'active' && styles(colors).segmentTextActive]}>
                            Active Wallet
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles(colors).segmentBtn, viewMode === 'history' && styles(colors).segmentBtnActive]}
                        onPress={() => setViewMode('history')}
                    >
                        <Text style={[styles(colors).segmentText, viewMode === 'history' && styles(colors).segmentTextActive]}>
                            History
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {viewMode === 'active' ? (
                <View style={styles(colors).carouselContainer}>
                    {isLoading ? (
                        <Text style={styles(colors).loadingText}>Loading Wallet...</Text>
                    ) : (data?.active?.length || 0) > 0 ? (
                        <FlatList
                            data={data!.active}
                            renderItem={({ item }) => <ActiveTicketCard item={item} colors={colors} />}
                            keyExtractor={(item) => item.id}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            snapToAlignment="center"
                            decelerationRate="fast"
                            refreshControl={
                                <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />
                            }
                        />
                    ) : (
                        <View style={styles(colors).emptyState}>
                            <Ionicons name="wallet-outline" size={80} color="rgba(255,255,255,0.3)" />
                            <Text style={styles(colors).emptyText}>Your wallet is empty</Text>
                            <Text style={styles(colors).emptySubtext}>Buy a ticket to see it here</Text>
                        </View>
                    )}

                    {/* Pagination Dots */}
                    {(data?.active?.length || 0) > 1 && (
                        <View style={styles(colors).pagination}>
                            {data!.active.map((_, i) => (
                                <View key={i} style={[styles(colors).dot, i === 0 && styles(colors).dotActive]} />
                            ))}
                        </View>
                    )}
                </View>
            ) : (
                <FlatList
                    data={data?.history}
                    renderItem={({ item }) => <HistoryTicketRow item={item} colors={colors} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles(colors).listContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles(colors).emptyState}>
                            <Text style={styles(colors).emptyText}>No history yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#132439',
    },
    headerContainer: {
        paddingBottom: 10,
        paddingHorizontal: 20,
        backgroundColor: '#132439',
        zIndex: 10,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 4,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    segmentBtnActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    segmentText: {
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        fontSize: 14,
    },
    segmentTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    carouselContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeCard: {
        width: CARD_WIDTH,
        height: 480,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 1,
    },
    qrContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    qrBackground: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
    },
    cardFooter: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.3)',
        paddingTop: 15,
    },
    ticketId: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontFamily: 'Courier', // Monospace for ID
        fontWeight: 'bold',
    },
    priceTag: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dateText: {
        color: 'rgba(255,255,255,0.9)',
        marginTop: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    pagination: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#fff',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    },
    emptyText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        marginTop: 5,
    },
    listContent: {
        padding: 20,
    },
    historyCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyIcon: {
        marginRight: 15,
    },
    historyTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    historyDate: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        backgroundColor: colors.border,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    badgeText: {
        color: colors.text,
        fontSize: 10,
        fontWeight: 'bold',
    },
});
