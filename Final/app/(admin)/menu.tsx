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

export default function MenuScreen() {
    const { user } = useAuth();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');

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

    // Reset selection when meal type changes, but show existing if available
    React.useEffect(() => {
        setSelectedImage(null);
    }, [mealType]);

    // Use selected image OR existing image for preview
    const displayImage = selectedImage || existingMenu?.image_url;

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const uploadMenu = async () => {
        if (!selectedImage) {
            Alert.alert('No Image', 'Please select an image first');
            return;
        }

        setUploading(true);
        try {
            // 1. Prepare file
            const date = new Date().toISOString().split('T')[0];
            const fileName = `${date}_${mealType}_${new Date().getTime()}.jpg`;
            const filePath = `${fileName}`;

            // 2. Upload to Storage
            // Read the file as base64 using FileSystem (works in React Native)
            const base64 = await FileSystem.readAsStringAsync(selectedImage, {
                encoding: 'base64',
            });

            // Convert base64 to ArrayBuffer for Supabase
            const arrayBuffer = decode(base64);

            const { error: uploadError, data } = await supabase.storage
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

            Alert.alert('Success', 'Menu updated successfully!');
            setSelectedImage(null);
            refetch(); // Refresh the "existing" image view

        } catch (error: any) {
            Alert.alert('Upload Failed', error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Update Daily Menu</Text>

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
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.previewContainer}>
                {displayImage ? (
                    <Image source={{ uri: displayImage }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="restaurant-outline" size={64} color="#ccc" />
                        <Text style={styles.placeholderText}>No image selected</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color="#007AFF" />
                <Text style={styles.pickButtonText}>Pick Image from Gallery</Text>
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
                    <Text style={styles.uploadButtonText}>Upload Menu</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    selectorContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 4,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    typeButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    typeText: {
        color: '#666',
        fontWeight: '600',
    },
    typeTextActive: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    previewContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#eee',
        borderStyle: 'dashed',
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
        color: '#999',
    },
    pickButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: '#F0F8FF',
        borderRadius: 12,
        marginBottom: 15,
    },
    pickButtonText: {
        marginLeft: 10,
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 16,
    },
    uploadButton: {
        backgroundColor: '#34C759',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    uploadButtonDisabled: {
        backgroundColor: '#ccc',
    },
    uploadButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
