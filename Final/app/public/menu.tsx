import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Platform, Modal } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

// Define types for menu items
interface MenuItem {
    id: string;
    image_url: string;
    meal_type: 'daily_overview' | 'breakfast' | 'lunch' | 'dinner';
    menu_date: string;
    // Add any other properties that exist in your 'menu_images' table
}

// Define the possible return types for the useQuery hook
type DailyMenuData = { type: 'daily'; data: MenuItem };
type MealsMenuData = { type: 'meals'; data: MenuItem[] };
type MenuQueryResult = DailyMenuData | MealsMenuData | null;

export default function PublicMenuScreen() {
    const todayParams = new Date().toISOString().split('T')[0];
    const [fullScreenImage, setFullScreenImage] = React.useState<string | null>(null);

    const { data: menuData, isLoading, error } = useQuery<MenuQueryResult>({
        queryKey: ['public_menu', todayParams],
        queryFn: async () => {
            // 1. Try to fetch "Daily Overview" poster
            const { data: dailyImage } = await supabase
                .from('menu_images')
                .select('*')
                .eq('meal_type', 'daily_overview')
                .eq('menu_date', todayParams)
                .single();

            if (dailyImage) return { type: 'daily', data: dailyImage } as const;

            // 2. If no poster, fetch all meals for today
            const { data: meals } = await supabase
                .from('menu_images')
                .select('*')
                .in('meal_type', ['breakfast', 'lunch', 'dinner'])
                .eq('menu_date', todayParams);

            if (meals && meals.length > 0) {
                // Sort meals: Breakfast -> Lunch -> Dinner
                const order: Record<string, number> = { breakfast: 1, lunch: 2, dinner: 3 };
                const sortedMeals = meals.sort((a, b) => (order[a.meal_type] || 99) - (order[b.meal_type] || 99));
                return { type: 'meals', data: sortedMeals } as const;
            }

            return null;
        },
        refetchInterval: 10000, // Poll every 10 seconds
        refetchOnWindowFocus: true,
    });

    const openStoreLink = () => {
        // Placeholder for app store link
        Linking.openURL('https://kanteen.app/download');
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#001F3F" />
                <Text style={styles.loadingText}>Loading Today's Menu...</Text>
            </View>
        );
    }

    if (error || !menuData) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="restaurant-outline" size={64} color="#ccc" />
                    <Text style={styles.errorText}>No Menu Available for Today</Text>
                    <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Touchless Menu</Text>
                <Text style={styles.headerDate}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {menuData.type === 'daily' ? (
                    <View style={styles.dailyPosterContainer}>
                        <TouchableOpacity onPress={() => setFullScreenImage(menuData.data.image_url)} activeOpacity={0.9}>
                            <Image
                                source={{ uri: `${menuData.data.image_url}?t=${new Date().getTime()}` }}
                                style={styles.dailyPoster}
                                resizeMode="contain"
                            />
                            <View style={styles.expandIcon}>
                                <Ionicons name="expand-outline" size={24} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.mealsList}>
                        {/* Force cast to any to map over the array since TS might infer data as single object union */}
                        {(menuData.data as MenuItem[]).map((meal: MenuItem) => (
                            <View key={meal.id} style={styles.mealCard}>
                                <View style={styles.mealHeader}>
                                    <Text style={styles.mealType}>{meal.meal_type.toUpperCase()}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setFullScreenImage(meal.image_url)} activeOpacity={0.9}>
                                    <Image
                                        source={{ uri: `${meal.image_url}?t=${new Date().getTime()}` }}
                                        style={styles.mealImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.expandIcon}>
                                        <Ionicons name="expand-outline" size={20} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={!!fullScreenImage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setFullScreenImage(null)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setFullScreenImage(null)}
                    >
                        <Ionicons name="close-circle" size={40} color="#fff" />
                    </TouchableOpacity>
                    {fullScreenImage && (
                        <Image
                            source={{ uri: fullScreenImage }}
                            style={styles.fullScreenImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>

            {/* Sticky Footer CTA */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.ctaButton} onPress={openStoreLink}>
                    <Text style={styles.ctaText}>Get Kanteen App</Text>
                    <Ionicons name="phone-portrait-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // Max width for desktop readability
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
        ...Platform.select({
            web: {
                boxShadow: '0 0 20px rgba(0,0,0,0.1)'
            }
        } as any) // Type cast to fix boxShadow error
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        color: '#001F3F',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#001F3F', // Navy Blue
    },
    headerDate: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 100, // Space for footer
    },
    dailyPosterContainer: {
        width: '100%',
        minHeight: 500, // Ensure it takes up vertical space
    },
    dailyPoster: {
        width: '100%',
        // Aspect ratio trick can be tricky with dynamic images, 
        // using a responsive height or aspect ratio based on data would be better usually.
        // For now, let's assume a reasonable height or use 'contain' with Flex.
        height: 600,
        backgroundColor: '#f5f5f5',
    },
    mealsList: {
        padding: 20,
    },
    mealCard: {
        marginBottom: 30,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    mealHeader: {
        padding: 12,
        backgroundColor: '#001F3F',
    },
    mealType: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
        letterSpacing: 1,
    },
    mealImage: {
        width: '100%',
        height: 250,
        backgroundColor: '#eee',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center',
        // Ensure web safe area
        paddingBottom: Platform.OS === 'web' ? 20 : 34,
    },
    ctaButton: {
        flexDirection: 'row',
        backgroundColor: '#001F3F',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 50,
        alignItems: 'center',
        shadowColor: '#001F3F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    ctaText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    expandIcon: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
    fullScreenImage: {
        width: '100%',
        height: '90%',
    },
});
