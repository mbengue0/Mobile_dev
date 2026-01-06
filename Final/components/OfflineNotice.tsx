import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OfflineNotice() {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    if (isConnected !== false) {
        return null;
    }

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <StatusBar backgroundColor="#b52424" barStyle="light-content" />
            <View style={styles.offlineContainer}>
                <Text style={styles.offlineText}>No Internet Connection - Showing Cached Data</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#b52424',
    },
    offlineContainer: {
        backgroundColor: '#b52424',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
    },
    offlineText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
});
