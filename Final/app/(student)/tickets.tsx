import React, { useState, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
    Modal,
} from 'react-native';
import { useTickets, Ticket } from '../../hooks/useTickets';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

// --- Helper Functions ---

const getMealColor = (mealType: string) => {
    switch (mealType) {
        case 'breakfast':
            return '#F2994A'; // Orange
        case 'lunch':
            return '#132439'; // Navy Blue
        case 'dinner':
            return '#8E44AD'; // Purple
        default:
            return '#34495E';
    }
};

const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};

// --- Sub-Components ---

// 1. Summary Card (The Stack) - Boarding Pass Style
const TicketStackCard = React.memo(({ stack, colors, onPress }: { stack: { type: string, count: number, tickets: Ticket[] }, colors: any, onPress: () => void }) => {
    const accentColor = getMealColor(stack.type);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={{ width: width, alignItems: 'center', justifyContent: 'center' }}
        >
            <View style={styles(colors).cardContainer}>
                {/* 1. Header Accent */}
                <View style={[styles(colors).cardHeaderAccent, { backgroundColor: accentColor }]}>
                    <Text style={styles(colors).headerTitle}>{stack.type.toUpperCase()}</Text>
                    <Ionicons name="layers" size={24} color="rgba(255,255,255,0.9)" />
                </View>

                {/* 2. White Body */}
                <View style={styles(colors).cardBody}>
                    <View style={styles(colors).countContainer}>
                        <Text style={[styles(colors).countText, { color: accentColor }]}>x{stack.count}</Text>
                        <Text style={styles(colors).countLabel}>Available</Text>
                    </View>

                    {/* Fake Perforation Line */}
                    <View style={styles(colors).perforationLine}>
                        <View style={[styles(colors).cutout, { left: -30 }]} />
                        <View style={styles(colors).dashedLine} />
                        <View style={[styles(colors).cutout, { right: -30 }]} />
                    </View>

                    <View style={styles(colors).cardFooter}>
                        <Text style={styles(colors).tapText}>Tap to Scan</Text>
                        <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

// 2. The Detailed Ticket (Inside Modal) - Boarding Pass Style
const ModalTicketItem = React.memo(({ item, colors, index, total }: { item: Ticket; colors: any, index: number, total: number }) => {
    const accentColor = getMealColor(item.meal_type);

    return (
        <View style={{ width: width, alignItems: 'center', justifyContent: 'center' }}>
            <View style={styles(colors).cardContainer}>
                {/* 1. Header Accent */}
                <View style={[styles(colors).cardHeaderAccent, { backgroundColor: accentColor }]}>
                    <Text style={styles(colors).headerTitle}>BOARDING PASS</Text>
                    <Text style={styles(colors).headerCounter}>{index + 1} of {total}</Text>
                </View>

                {/* 2. White Body */}
                <View style={styles(colors).cardBody}>
                    {/* Info Row */}
                    <View style={styles(colors).ticketInfoRow}>
                        <View>
                            <Text style={styles(colors).infoLabel}>MEAL</Text>
                            <Text style={styles(colors).infoValue}>{item.meal_type.toUpperCase()}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles(colors).infoLabel}>DATE</Text>
                            <Text style={styles(colors).infoValue}>{formatDate(item.meal_date)}</Text>
                        </View>
                    </View>

                    {/* QR Code */}
                    <View style={styles(colors).qrWrapper}>
                        <QRCode value={item.qr_code_data} size={180} backgroundColor="white" />
                    </View>
                    <Text style={styles(colors).ticketId}>#{item.ticket_number}</Text>

                    {/* Footer Price */}
                    <View style={styles(colors).ticketPriceContainer}>
                        <Text style={styles(colors).priceLabel}>PRICE</Text>
                        <Text style={[styles(colors).priceValue, { color: accentColor }]}>{item.price} XAF</Text>
                    </View>
                </View>
            </View>
        </View>
    );
});

const HistoryTicketRow = React.memo(({ item, colors }: { item: Ticket; colors: any }) => (
    <View style={styles(colors).historyCard}>
        <View style={styles(colors).historyIcon}>
            <Ionicons
                name={item.status === 'used' ? "checkmark-circle" : "alert-circle"}
                size={24}
                color={item.status === 'used' ? '#132439' : '#E74C3C'}
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

    // Modal State
    const [selectedStackType, setSelectedStackType] = useState<string | null>(null);

    // Grouping Logic
    const stacks = useMemo(() => {
        if (!data?.active) return [];

        const groups: Record<string, Ticket[]> = {
            breakfast: [],
            lunch: [],
            dinner: []
        };
        data.active.forEach(t => {
            if (groups[t.meal_type]) {
                if (!groups[t.meal_type]) groups[t.meal_type] = [];
                groups[t.meal_type].push(t);
            }
        });
        return Object.keys(groups)
            .map(type => ({
                type,
                count: groups[type].length,
                tickets: groups[type]
            }))
            .filter(stack => stack.count > 0);
    }, [data?.active]);

    const modalTickets = useMemo(() => {
        if (!selectedStackType) return [];
        return stacks.find(s => s.type === selectedStackType)?.tickets || [];
    }, [selectedStackType, stacks]);

    React.useEffect(() => {
        if (selectedStackType && modalTickets.length === 0) {
            setSelectedStackType(null);
        }
    }, [modalTickets.length, selectedStackType]);


    return (
        <View style={styles(colors).container}>
            {/* Header / Segmented Control */}
            <View style={[styles(colors).headerContainer, { paddingTop: insets.top + 10 }]}>
                <View style={styles(colors).headerTop}>
                    <Text style={styles(colors).screenTitle}>My Tickets</Text>
                </View>
                <View style={styles(colors).segmentedControl}>
                    <TouchableOpacity
                        style={[styles(colors).segmentBtn, viewMode === 'active' && styles(colors).segmentBtnActive]}
                        onPress={() => setViewMode('active')}
                    >
                        <Text style={[styles(colors).segmentText, viewMode === 'active' && styles(colors).segmentTextActive]}>
                            Active
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
                        <Text style={styles(colors).loadingText}>Loading...</Text>
                    ) : stacks.length > 0 ? (
                        <FlatList
                            data={stacks}
                            renderItem={({ item }) => (
                                <TicketStackCard
                                    stack={item}
                                    colors={colors}
                                    onPress={() => setSelectedStackType(item.type)}
                                />
                            )}
                            keyExtractor={(item) => item.type}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            snapToAlignment="center"
                            decelerationRate="fast"
                            refreshControl={
                                <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                            }
                        />
                    ) : (
                        <View style={styles(colors).emptyState}>
                            <Ionicons name="wallet-outline" size={60} color="#ccc" />
                            <Text style={styles(colors).emptyText}>Empty Wallet</Text>
                            <Text style={styles(colors).emptySubtext}>Purchased tickets appear here</Text>
                        </View>
                    )}
                    {/* Pagination Dots */}
                    {stacks.length > 1 && (
                        <View style={styles(colors).pagination}>
                            {stacks.map((_, i) => (
                                <View key={i} style={[styles(colors).dot, i === 0 ? styles(colors).dotActive : {}]} />
                                // Note: Simple dot logic for now
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
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                    }
                    ListEmptyComponent={
                        <View style={styles(colors).emptyState}>
                            <Text style={styles(colors).emptyText}>No history yet</Text>
                        </View>
                    }
                />
            )}

            {/* Full Screen Scanner Modal */}
            <Modal
                visible={!!selectedStackType}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedStackType(null)}
            >
                <View style={styles(colors).modalContainer}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={[styles(colors).closeButton, { top: insets.top + 20 }]}
                        onPress={() => setSelectedStackType(null)}
                    >
                        <Ionicons name="close-circle" size={40} color="#fff" />
                    </TouchableOpacity>

                    {/* Modal Content - Carousel of specific tickets */}
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <FlatList
                            data={modalTickets}
                            renderItem={({ item, index }) => (
                                <ModalTicketItem
                                    item={item}
                                    colors={colors}
                                    index={index}
                                    total={modalTickets.length}
                                />
                            )}
                            keyExtractor={(item) => item.id}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            snapToAlignment="center"
                            decelerationRate="fast"
                        />
                    </View>
                    <Text style={styles(colors).modalHint}>Show this code to the scanner</Text>
                </View>
            </Modal>
        </View>
    );
}

const styles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Light Grey Background
    },
    headerContainer: {
        paddingBottom: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        zIndex: 10,
    },
    headerTop: {
        marginBottom: 10,
        alignItems: 'center',
    },
    screenTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#132439',
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        padding: 4,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 10,
    },
    segmentBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    segmentText: {
        color: '#888',
        fontWeight: '600',
        fontSize: 14,
    },
    segmentTextActive: {
        color: '#132439', // Navy Blue
        fontWeight: 'bold',
    },
    carouselContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Ticket Stack Card
    cardContainer: {
        width: CARD_WIDTH,
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden',
    },
    cardHeaderAccent: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    headerCounter: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
    },
    cardBody: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    // Stack Specific
    countContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    countText: {
        fontSize: 60,
        fontWeight: 'bold',
    },
    countLabel: {
        color: '#888',
        fontSize: 16,
        fontWeight: '500',
        marginTop: -5,
    },
    perforationLine: {
        width: '120%',
        height: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 30,
        position: 'relative',
    },
    dashedLine: {
        width: '100%',
        height: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    cutout: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F5F7FA', // Match screen background
        top: -10,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    tapText: {
        color: '#888',
        fontSize: 14,
        marginRight: 8,
    },
    // Modal Ticket Info
    ticketInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    infoLabel: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoValue: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    qrWrapper: {
        padding: 10,
        backgroundColor: '#fff',
    },
    ticketId: {
        color: '#ccc',
        fontSize: 12,
        fontFamily: 'Courier',
        marginTop: 10,
        letterSpacing: 1,
    },
    ticketPriceContainer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 15,
        width: '100%',
        alignItems: 'center',
    },
    priceLabel: {
        color: '#aaa',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 2,
    },
    priceValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(19, 36, 57, 0.95)', // Navy Backdrop
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        zIndex: 20,
    },
    modalHint: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        marginBottom: 40,
    },

    // Shared
    loadingText: { color: '#888', fontSize: 16 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#333', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
    emptySubtext: { color: '#888', fontSize: 14 },
    listContent: { padding: 20 },
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    historyIcon: { marginRight: 15 },
    historyTitle: { color: '#333', fontSize: 16, fontWeight: 'bold' },
    historyDate: { color: '#888', fontSize: 12, marginTop: 2 },
    badge: { backgroundColor: '#f0f0f0', padding: 6, borderRadius: 6 },
    badgeText: { color: '#555', fontSize: 10, fontWeight: 'bold' },
    pagination: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ddd',
        marginHorizontal: 3,
    },
    dotActive: {
        backgroundColor: '#132439', // Navy active
    },
});
