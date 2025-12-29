import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import LottieView from 'lottie-react-native';

interface AnimatedSplashScreenProps {
    isLoading: boolean;
    children: React.ReactNode;
}

export default function AnimatedSplashScreen({ isLoading, children }: AnimatedSplashScreenProps) {
    const opacity = useRef(new Animated.Value(1)).current;
    const [showSplash, setShowSplash] = React.useState(true);
    const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

    // Ensure splash shows for minimum 2 seconds
    useEffect(() => {
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
            // Start fade out animation
            Animated.timing(opacity, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }).start(() => {
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
                <View style={styles.content}>
                    {/* Lottie Animation */}
                    <LottieView
                        source={require('../assets/animations/splash_animation.json')}
                        autoPlay
                        loop
                        style={styles.animation}
                    />

                    {/* Brand Logo Text */}
                    <Text style={styles.brandText}>UniTicket</Text>
                    <Text style={styles.tagline}>Smart Campus Dining</Text>
                </View>
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
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    animation: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    brandText: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FF4757',
        letterSpacing: -1,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
        letterSpacing: 0.5,
    },
});
