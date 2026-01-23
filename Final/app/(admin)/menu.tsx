import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { decode } from 'base64-arraybuffer';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../providers/ThemeProvider';
import { useTranslation } from 'react-i18next';

type DisplayMode = 'daily' | 'individual';
type ExtendedMealType = 'breakfast' | 'lunch' | 'dinner' | 'daily_overview';

export default function MenuScreen() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { colors } = useTheme();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const [displayMode, setDisplayMode] = useState<DisplayMode>('daily');
    const [mealType, setMealType] = useState<ExtendedMealType>('daily_overview');

    // Sync mealType when mode changes
    React.useEffect(() => {
        if (displayMode === 'daily') {
            setMealType('daily_overview');
        } else {
            setMealType('lunch'); // Default for individual
        }
        setSelectedImage(null);
    }, [displayMode]);

    // Fire and forget cleanup on mount
    React.useEffect(() => {
        const cleanup = async () => {
            const { data, error } = await supabase.rpc('cleanup_old_menu_images');
            if (error) {
                console.log('Cleanup error:', error);
            } else {
                console.log('Cleanup result:', data);
            }
        };
        cleanup();
    }, []);

    // Fetch existing menu image for the selected meal type
    const { data: existingMenu, refetch } = useQuery({
        queryKey: ['admin_menu_image', mealType],
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('menu_images')
                .select('image_url')
                .eq('meal_type', mealType)
                .eq('menu_date', today)
                .single();

            if (error && error.code !== 'PGRST116') return null;
            return data;
        },
    });

    // Reset selection when meal type changes manually (in individual mode)
    React.useEffect(() => {
        setSelectedImage(null);
    }, [mealType]);

    // Use selected image OR existing image for preview
    const displayImage = selectedImage || existingMenu?.image_url;

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            // aspect: displayMode === 'daily' ? [9, 16] : [4, 3], // Disabled to allow full image
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const uploadMenu = async () => {
        if (!selectedImage) {
            Alert.alert(t('common.error'), t('admin.menu.placeholder'));
            return;
        }

        setUploading(true);
        try {
            // 1. Prepare file
            const date = new Date().toISOString().split('T')[0];
            const fileName = `${date}_${mealType}_${new Date().getTime()}.jpg`;
            const filePath = `${fileName}`;

            // 2. Upload to Storage
            const base64 = await FileSystem.readAsStringAsync(selectedImage, {
                encoding: 'base64',
            });

            const arrayBuffer = decode(base64);

            const { error: uploadError } = await supabase.storage
                .from('menu_images')
                .upload(filePath, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('menu_images')
                .getPublicUrl(filePath);

            // 4. Save to Database
            const { error: dbError } = await supabase
                .from('menu_images')
                .upsert({
                    meal_type: mealType,
                    menu_date: date,
                    image_url: publicUrl,
                    uploaded_by: user?.id,
                }, { onConflict: 'meal_type, menu_date' });

            if (dbError) throw dbError;

            Alert.alert(t('common.success'), t('admin.menu.success'));
            setSelectedImage(null);
            refetch();

        } catch (error: any) {
            Alert.alert(t('common.error'), error.message);
        } finally {
            setUploading(false);
        }
    };

    const styles = getStyles(colors);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{t('admin.menu.title')}</Text>

            {/* Mode Switcher */}
            <View style={styles.modeContainer}>
                <TouchableOpacity
                    style={[styles.modeButton, displayMode === 'daily' && styles.modeButtonActive]}
                    onPress={() => setDisplayMode('daily')}
                >
                    <Text style={[styles.modeText, displayMode === 'daily' && styles.modeTextActive]}>{t('admin.menu.dailyPoster')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeButton, displayMode === 'individual' && styles.modeButtonActive]}
                    onPress={() => setDisplayMode('individual')}
                >
                    <Text style={[styles.modeText, displayMode === 'individual' && styles.modeTextActive]}>{t('admin.menu.byMeal')}</Text>
                </TouchableOpacity>
            </View>

            {/* Meal Selector (Only in Individual Mode) */}
            {displayMode === 'individual' && (
                <View style={styles.selectorContainer}>
                    {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.typeButton,
                                mealType === type && styles.typeButtonActive,
                            ]}
                            onPress={() => setMealType(type)}
                        >
                            <Text
                                style={[
                                    styles.typeText,
                                    mealType === type && styles.typeTextActive,
                                ]}
                            >
                                {t(`meals.${type}`)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Preview Container - Taller for Daily Mode */}
            <View style={[styles.previewContainer, displayMode === 'daily' && styles.previewContainerTall]}>
                {displayImage ? (
                    <Image source={{ uri: displayImage }} style={styles.image} resizeMode={displayMode === 'daily' ? 'contain' : 'cover'} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons
                            name={displayMode === 'daily' ? "document-text-outline" : "restaurant-outline"}
                            size={64}
                            color={colors.textSecondary}
                        />
                        <Text style={styles.placeholderText}>
                            {displayMode === 'daily' ? t('admin.menu.placeholderDaily') : t('admin.menu.placeholder')}
                        </Text>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color={colors.primary} />
                <Text style={styles.pickButtonText}>{t('admin.menu.pickImage')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.uploadButton,
                    (!selectedImage || uploading) && styles.uploadButtonDisabled,
                ]}
                onPress={uploadMenu}
                disabled={!selectedImage || uploading}
            >
                {uploading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.uploadButtonText}>
                        {displayMode === 'daily' ? t('admin.menu.uploadPoster') : t('admin.menu.uploadMeal')}
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: colors.background,
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.text,
        textAlign: 'center',
    },
    // Mode Switcher
    modeContainer: {
        flexDirection: 'row',
        backgroundColor: colors.border,
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    modeButtonActive: {
        backgroundColor: colors.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    modeText: {
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
    modeTextActive: {
        color: colors.primary,
        fontWeight: 'bold',
    },

    selectorContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    typeButtonActive: {
        backgroundColor: colors.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.border,
    },
    typeText: {
        color: colors.textSecondary,
        fontWeight: '600',
    },
    typeTextActive: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    previewContainer: {
        width: '100%',
        height: 250, // Default landscape height
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    previewContainerTall: {
        height: 450, // Taller for posters
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 10,
        color: colors.textSecondary,
    },
    pickButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: colors.card,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pickButtonText: {
        marginLeft: 10,
        color: colors.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    uploadButton: {
        backgroundColor: colors.success,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    uploadButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    uploadButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
