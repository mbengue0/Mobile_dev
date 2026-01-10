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
// import { BlurView } from 'expo-blur'; // removed to minimize deps

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

// --- Helper Functions ---

const getMealGradient = (mealType: string): [string, string, ...string[]] => {
    switch (mealType) {
        case 'breakfast':
            return ['#F2994A', '#F2C94C']; // Sunrise Orange -> Yellow
        case 'lunch':
            return ['#2980B9', '#6DD5FA']; // Dark Blue -> Light Blue
        case 'dinner':
            return ['#8E44AD', '#53346D']; // Purple -> Indigo
        default:
            return ['#34495E', '#2C3E50'];
    }
};

const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};

// --- Sub-Components ---

// 1. Summary Card (The Stack)
const TicketStackCard = React.memo(({ stack, colors, onPress }: { stack: { type: string, count: number, tickets: Ticket[] }, colors: any, onPress: () => void }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={{ width: width, alignItems: 'center', justifyContent: 'center' }}
        >
            <LinearGradient
                colors={getMealGradient(stack.type)}
                style={styles(colors).stackCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles(colors).stackContent}>
                    <View style={styles(colors).stackHeader}>
                        <Text style={styles(colors).stackTitle}>{stack.type.toUpperCase()}</Text>
                        <Ionicons name="layers-outline" size={32} color="rgba(255,255,255,0.8)" />
                    </View>

                    <View style={styles(colors).countContainer}>
                        <Text style={styles(colors).countText}>x{stack.count}</Text>
                        <Text style={styles(colors).countLabel}>Tickets Available</Text>
                    </View>

                    <View style={styles(colors).stackFooter}>
                        <Text style={styles(colors).tapText}>Tap to Scan</Text>
                        <Ionicons name="arrow-forward-circle" size={30} color="#fff" />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
});

// 2. The Detailed Ticket (Inside Modal)
const ModalTicketItem = React.memo(({ item, colors, index, total }: { item: Ticket; colors: any, index: number, total: number }) => {
    return (
        <View style={{ width: width, alignItems: 'center', justifyContent: 'center' }}>
            <LinearGradient
                colors={getMealGradient(item.meal_type)}
                style={styles(colors).modalCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Header */}
                <View style={styles(colors).modalCardHeader}>
                    <Text style={styles(colors).modalTitle}>
                        {item.meal_type.toUpperCase()}
                    </Text>
                    <Text style={styles(colors).modalCounter}>
                        {index + 1} / {total}
                    </Text>
                </View>

                {/* QR Code */}
                <View style={styles(colors).modalQrContainer}>
                    <View style={styles(colors).qrBackground}>
                        <QRCode value={item.qr_code_data} size={200} backgroundColor="white" />
                    </View>
                    <Text style={styles(colors).modalTicketId}>#{item.ticket_number}</Text>
                </View>

                {/* Footer */}
                <View style={styles(colors).modalCardFooter}>
                    <Text style={styles(colors).modalDate}>
                        {formatDate(item.meal_date)}
                    </Text>
                    <Text style={styles(colors).modalPrice}>{item.price} XAF</Text>
                </View>
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

        // Strict grouping
        data.active.forEach(t => {
            if (groups[t.meal_type]) {
                groups[t.meal_type].push(t);
            }
        });

        // Convert to array (only non-empty stacks)
        return Object.keys(groups)
            .map(type => ({
                type,
                count: groups[type].length,
                tickets: groups[type] // Already sorted by Oldest First via hook
            }))
            .filter(stack => stack.count > 0);
    }, [data?.active]);

    // Active Tickets for Modal
    const modalTickets = useMemo(() => {
        if (!selectedStackType) return [];
        return stacks.find(s => s.type === selectedStackType)?.tickets || [];
    }, [selectedStackType, stacks]);

    // Auto-close modal if tickets run out (Realtime update)
    React.useEffect(() => {
        if (selectedStackType && modalTickets.length === 0) {
            setSelectedStackType(null); // Close modal
        }
    }, [modalTickets.length, selectedStackType]);


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
                            My Wallet
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
                                <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />
                            }
                        />
                    ) : (
                        <View style={styles(colors).emptyState}>
                            <Ionicons name="wallet-outline" size={80} color="rgba(255,255,255,0.3)" />
                            <Text style={styles(colors).emptyText}>Your wallet is empty</Text>
                            <Text style={styles(colors).emptySubtext}>Buy tickets to see them here</Text>
                        </View>
                    )}
                    {/* Pagination Dots */}
                    {stacks.length > 1 && (
                        <View style={styles(colors).pagination}>
                            {stacks.map((_, i) => (
                                <View key={i} style={[styles(colors).dot, styles(colors).dotActive]} />
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
                    <Text style={styles(colors).modalHint}>Swipe to see next ticket</Text>
                </View>
            </Modal>
        </View>
    );
}

const styles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#132439',
    },
    headerContainer: {
        paddingBottom: 15,
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Ticket Stack Card
    stackCard: {
        width: CARD_WIDTH,
        height: 420,
        borderRadius: 24,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    stackContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    stackHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stackTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 1,
    },
    countContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: {
        color: '#fff',
        fontSize: 80,
        fontWeight: 'bold',
    },
    countLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 5,
        letterSpacing: 1,
    },
    stackFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 12,
        borderRadius: 50,
    },
    tapText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)', // Dark backdrop
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
    modalCard: {
        width: CARD_WIDTH,
        height: 520,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    modalCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    modalCounter: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 18,
        fontWeight: '600',
    },
    modalQrContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrBackground: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 24,
    },
    modalTicketId: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontFamily: 'Courier',
        fontWeight: 'bold',
        marginTop: 20,
        letterSpacing: 2,
    },
    modalCardFooter: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.3)',
        paddingTop: 20,
        marginTop: 20,
    },
    modalDate: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalPrice: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    // Shared
    loadingText: { color: '#fff', fontSize: 16 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    emptySubtext: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
    listContent: { padding: 20 },
    historyCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyIcon: { marginRight: 15 },
    historyTitle: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    historyDate: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
    badge: { backgroundColor: colors.border, padding: 6, borderRadius: 6 },
    badgeText: { color: colors.text, fontSize: 10, fontWeight: 'bold' },
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
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 3,
    },
    dotActive: {
        backgroundColor: '#fff',
    },
});
