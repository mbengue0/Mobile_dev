import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

export default function CreateStaffScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation State
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);

    const validateName = (text: string) => {
        setFullName(text);
        if (/\d/.test(text)) {
            setNameError('Names cannot contain numbers.');
        } else if (text.length > 0 && text.trim().length < 2) {
            setNameError('Name is too short.');
        } else {
            setNameError(null);
        }
    };

    const validateEmail = (text: string) => {
        setEmail(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (text.length > 0 && !emailRegex.test(text)) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError(null);
        }
    };

    const validatePassword = (text: string) => {
        setPassword(text);
        const hasNumber = /\d/.test(text);
        const hasLetter = /[a-zA-Z]/.test(text);
        const minLength = 6;

        if (text.length === 0) {
            setPasswordError(null);
            return;
        }

        if (text.length < minLength) {
            setPasswordError('Password must be at least 6 characters');
        } else if (!hasNumber) {
            setPasswordError('Password must contain at least one number');
        } else if (!hasLetter) {
            setPasswordError('Password must contain at least one letter');
        } else {
            setPasswordError(null);
        }
    };

    const handleCreate = async () => {
        const cleanName = fullName.trim();
        const cleanEmail = email.trim();
        const cleanPassword = password; // Passwords shouldn't be trimmed usually, but trailing space might be intended? Let's use as is.

        // 1. Basic Empty Check
        if (!cleanEmail || !cleanPassword || !cleanName) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }

        // 2. Strict Submission Validation (Double-Check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const hasNumber = /\d/.test(cleanPassword);
        const hasLetter = /[a-zA-Z]/.test(cleanPassword);

        if (!emailRegex.test(cleanEmail)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        if (cleanPassword.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }
        if (!hasNumber) {
            Alert.alert('Weak Password', 'Password must contain at least one number.');
            return;
        }
        if (!hasLetter) {
            Alert.alert('Weak Password', 'Password must contain at least one letter.');
            return;
        }

        // 3. Name Validation
        if (/\d/.test(cleanName)) {
            Alert.alert('Invalid Name', 'Names cannot contain numbers.');
            return;
        }

        try {
            setLoading(true);
            console.log("Calling create-user function...");

            const { data, error } = await supabase.functions.invoke('create-user', {
                body: {
                    email: cleanEmail,
                    password: cleanPassword,
                    full_name: cleanName,
                }
            });

            if (error) {
                console.error("Function Error:", error);
                throw new Error(error.message || 'Failed to invoke function');
            }

            if (data?.error) {
                console.error("Logic Error:", data.error);
                throw new Error(data.error);
            }

            Alert.alert('Success', 'Staff account created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (err: any) {
            const msg = err.message?.toLowerCase() || '';

            if (msg.includes('duplicate key') || msg.includes('unique constraint') || msg.includes('already registered')) {
                Alert.alert(
                    'Already Registered',
                    'This Email is already in use. Please check the Users list.'
                );
            } else if (msg.includes('database error') || msg.includes('upstream')) {
                Alert.alert('System Error', 'There was a problem creating the account. Please try again or check logs.');
            } else {
                Alert.alert('Creation Failed', err.message || 'An unknown error occurred.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="person-add" size={40} color="#5856D6" />
                    </View>
                    <Text style={styles.title}>Create Staff Account</Text>
                    <Text style={styles.subtitle}>
                        Add a new administrator to your institution.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('auth.fullName')}</Text>
                        <TextInput
                            style={[styles.input, nameError ? { marginBottom: 4, borderWidth: 1, borderColor: '#FF4444' } : {}]}
                            placeholder="e.g. Staff Member Name"
                            value={fullName}
                            onChangeText={validateName}
                        />
                        <Text style={[styles.helperText, nameError ? { color: '#FF4444' } : {}]}>
                            {nameError || "No numbers. (e.g. Mbaye Fall)"}
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('auth.email')}</Text>
                        <TextInput
                            style={[styles.input, emailError ? styles.inputError : {}]}
                            placeholder="e.g. staff@school.edu"
                            value={email}
                            onChangeText={validateEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <Text style={[styles.helperText, emailError ? { color: '#FF4444' } : {}]}>
                            {emailError || "Must contain '@' and '.'. (e.g. correct@email.com)"}
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('auth.password')}</Text>
                        <TextInput
                            style={[styles.input, passwordError ? styles.inputError : {}]}
                            placeholder="Min 6 characters"
                            value={password}
                            onChangeText={validatePassword}
                            secureTextEntry
                        />
                        <Text style={[styles.helperText, passwordError ? { color: '#FF4444' } : {}]}>
                            {passwordError || "Min 6 chars. Must mix letters & numbers."}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, (loading || !!passwordError || !!emailError || !!nameError) && styles.buttonDisabled]}
                        onPress={handleCreate}
                        disabled={loading || !!passwordError || !!emailError || !!nameError}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginVertical: 30,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E0E0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    inputError: {
        borderColor: '#FF4444',
        borderWidth: 1,
    },
    helperText: {
        color: '#999',
        fontSize: 12,
        marginLeft: 4,
        marginTop: 4,
    },
    button: {
        backgroundColor: '#5856D6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#A5A5EA',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
