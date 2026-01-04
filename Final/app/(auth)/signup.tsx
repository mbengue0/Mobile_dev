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

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSignup = async () => {
        if (!email || !password || !fullName) {
            Alert.alert('Missing Fields', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            const { error } = await signUp(email, password, fullName);

            if (error) {
                Alert.alert('Signup Failed', error.message || 'An unknown error occurred');
            } else {
                // Success!
                Alert.alert('Success', 'Account created! Please log in.', [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(auth)/login')
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
                        source={require('../../assets/splash-icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Create your Account</Text>
                    <Text style={styles.subtitle}>Smart Campus Dining</Text>
                </View>

                {/* Form Section */}
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#999"
                        value={fullName}
                        onChangeText={setFullName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password (min 6 characters)"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity style={styles.linkButton}>
                            <Text style={styles.linkText}>
                                Already have an account? <Text style={styles.linkHighlight}>Log In</Text>
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
});
