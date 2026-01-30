import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useRouter, Link } from 'expo-router';

import { useTranslation } from 'react-i18next';

export default function SignupScreen() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');

    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const validateName = (text: string) => {
        setFullName(text);
        if (/\d/.test(text)) {
            setNameError('Names cannot contain numbers.');
        } else if (text.length > 0 && text.length < 2) {
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
        const hasNumber = /\d/;
        const minLength = 6;

        if (text.length === 0) {
            setPasswordError(null);
            return;
        }

        if (text.length < minLength) {
            setPasswordError('Password must be at least 6 characters');
        } else if (!hasNumber.test(text)) {
            setPasswordError('Password must contain at least one number');
        } else {
            setPasswordError(null);
        }
    };

    const handleSignup = async () => {
        if (!email || !password || !fullName) {
            Alert.alert('Missing Fields', 'Please fill in all fields');
            return;
        }

        if (passwordError || emailError || nameError) {
            Alert.alert('Invalid Details', 'Please fix the errors in the form.');
            return;
        }

        // Final sanity check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        try {
            setLoading(true);
            const { error } = await signUp(email, password, fullName, studentId);

            if (error) {
                const msg = error.message?.toLowerCase() || '';
                if (msg.includes('duplicate key') || msg.includes('unique constraint') || msg.includes('already registered')) {
                    Alert.alert(
                        'Registration Failed',
                        'This Student ID or Email is already registered. Please login or check your details.'
                    );
                } else {
                    Alert.alert('Signup Failed', error.message || 'An unknown error occurred');
                }
            } else {
                Alert.alert('Welcome!', 'Account created successfully. Logging you in...', [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.replace('/(auth)/login');
                        }
                    },
                ]);
            }
        } catch (err) {
            Alert.alert('Error', 'An unexpected error occurred during signup');
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
                {/* Logo Section */}
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/splash-new-v2.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>{t('auth.signup')}</Text>
                    <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
                </View>

                {/* Form Section */}
                <View style={styles.form}>
                    <View>
                        <TextInput
                            style={[styles.input, nameError ? { marginBottom: 4, borderWidth: 1, borderColor: '#FF4444' } : { marginBottom: 4 }]}
                            placeholder={t('auth.fullName')}
                            placeholderTextColor="#999"
                            value={fullName}
                            onChangeText={validateName}
                        />
                        <Text style={[styles.helperText, nameError ? { color: '#FF4444' } : {}]}>
                            {nameError || "No numbers. (e.g. Jean Dupont)"}
                        </Text>
                    </View>

                    <View style={{ marginBottom: 16 }}>
                        <TextInput
                            style={[styles.input, { marginBottom: 4 }]}
                            placeholder={`${t('settings.studentId') || "Student ID"} (Optional)`}
                            placeholderTextColor="#999"
                            value={studentId}
                            onChangeText={setStudentId}
                            autoCapitalize="characters"
                        />
                        <Text style={styles.helperText}>
                            Unique school ID. (e.g. ST-202412)
                        </Text>
                    </View>

                    <View>
                        <TextInput
                            style={[styles.input, emailError ? { marginBottom: 4, borderWidth: 1, borderColor: '#FF4444' } : { marginBottom: 4 }]}
                            placeholder={t('auth.email')}
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={validateEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <Text style={[styles.helperText, emailError ? { color: '#FF4444' } : {}]}>
                            {emailError || "Must contain '@' and '.'. (e.g. correct@email.com)"}
                        </Text>
                    </View>

                    <View>
                        <TextInput
                            style={[styles.input, passwordError ? { marginBottom: 4, borderWidth: 1, borderColor: '#FF4444' } : { marginBottom: 4 }]}
                            placeholder={t('auth.password')}
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={validatePassword}
                            secureTextEntry
                        />
                        <Text style={[styles.helperText, passwordError ? { color: '#FF4444' } : {}]}>
                            {passwordError || "Min 6 characters, at least 1 number."}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, (loading || !!passwordError || !password) && { backgroundColor: '#ccc' }]}
                        onPress={handleSignup}
                        disabled={loading || !!passwordError || !password}
                    >
                        {loading ? (
                            <ActivityIndicator color="#132439" />
                        ) : (
                            <Text style={styles.buttonText}>{t('auth.signup')}</Text>
                        )}
                    </TouchableOpacity>

                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity style={styles.linkButton}>
                            <Text style={styles.linkText}>
                                {t('auth.hasAccount')}
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        backgroundColor: '#132439', // Unified Deep Navy Blue
    },
    container: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#132439', // Unified Deep Navy Blue
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF', // White for visibility on Navy
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFD700', // Gold to match splash screen tagline
        fontWeight: '500',
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: '#FFFFFF', // White inputs for high contrast
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 16,
        fontSize: 16,
        color: '#333',
        borderWidth: 0,
    },
    button: {
        backgroundColor: '#FFFFFF', // White button for contrast
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#132439', // Navy text on white button
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    linkText: {
        color: '#CCCCCC', // Light grey for readability on Navy
        fontSize: 14,
    },
    linkHighlight: {
        color: '#FFD700', // Gold for emphasis
        fontWeight: 'bold',
    },
    helperText: {
        color: '#CCCCCC',
        fontSize: 12,
        marginLeft: 4,
        marginTop: 2,
    }
});
