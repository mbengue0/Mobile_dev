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

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);

        if (error) {
            Alert.alert('Login Failed', error.message);
        } else {
            router.replace('/');
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
                    <Text style={styles.title}>Welcome to Kanteen</Text>
                    <Text style={styles.subtitle}>Smart Campus Dining</Text>
                </View>

                {/* Form Section */}
                <View style={styles.form}>
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
                        placeholder="Password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Log In</Text>
                        )}
                    </TouchableOpacity>

                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity style={styles.linkButton}>
                            <Text style={styles.linkText}>
                                Don't have an account? <Text style={styles.linkHighlight}>Sign up</Text>
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
        marginBottom: 48,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 24,
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
