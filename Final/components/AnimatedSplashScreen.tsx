import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface AnimatedSplashScreenProps {
    isLoading: boolean;
    children: React.ReactNode;
}

export default function AnimatedSplashScreen({ isLoading, children }: AnimatedSplashScreenProps) {
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const [showSplash, setShowSplash] = React.useState(true);
    const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

    // Ensure splash shows for minimum 2 seconds
    useEffect(() => {
        // Hide native splash screen immediately when this component mounts
        // so our animated splash takes over
        const hideNativeSplash = async () => {
            try {
                await SplashScreen.hideAsync();
            } catch (e) {
                console.warn(e);
            }
        };

        hideNativeSplash();

        const timer = setTimeout(() => {
            setMinTimeElapsed(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Only hide splash when BOTH conditions are met:
        // 1. Auth loading is complete (!isLoading)
        // 2. Minimum display time has elapsed (minTimeElapsed)
        if (!isLoading && minTimeElapsed && showSplash) {
            // Start fade out and scale up animation concurrently
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1.5,
                    duration: 800,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setShowSplash(false);
            });
        }
    }, [isLoading, minTimeElapsed]);

    if (!showSplash) {
        return <>{children}</>;
    }

    return (
        <>
            {children}
            <Animated.View style={[styles.splashContainer, { opacity }]}>
                <StatusBar barStyle="light-content" backgroundColor="#132439" />
                <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
                    {/* Brand Icon */}
                    <Image
                        source={require('../assets/splash-icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    {/* Brand Logo Text */}
                    <Text style={styles.brandText}>Kanteen</Text>
                    <Text style={styles.tagline}>Smart Campus Dining</Text>
                </Animated.View>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#132439', // Deep Navy Blue
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    brandText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#FFD700', // Gold for premium feel
        fontWeight: '500',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
