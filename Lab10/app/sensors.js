import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Button } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';

export default function SensorsScreen() {
    // Accelerometer
    const [data, setData] = useState({ x: 0, y: 0, z: 0 });
    const [subscription, setSubscription] = useState(null);

    const _subscribe = () => {
        setSubscription(
            Accelerometer.addListener(accelerometerData => {
                setData(accelerometerData);
            })
        );
    };

    const _unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    };

    useEffect(() => {
        _subscribe();
        return () => _unsubscribe();
    }, []);

    // Location
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    // Battery
    const [batteryLevel, setBatteryLevel] = useState(null);
    const [batteryState, setBatteryState] = useState(null);

    useEffect(() => {
        (async () => {
            const level = await Battery.getBatteryLevelAsync();
            setBatteryLevel(level);
            const state = await Battery.getPowerStateAsync();
            setBatteryState(state.batteryState);
        })();

        const subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
            setBatteryLevel(batteryLevel);
        });

        return () => subscription && subscription.remove();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Device Sensors</Text>

            <View style={styles.section}>
                <Text style={styles.subHeader}>Accelerometer</Text>
                <Text>x: {data.x.toFixed(2)}</Text>
                <Text>y: {data.y.toFixed(2)}</Text>
                <Text>z: {data.z.toFixed(2)}</Text>
                <View style={styles.buttonContainer}>
                    <Button onPress={subscription ? _unsubscribe : _subscribe} title={subscription ? 'Stop' : 'Start'} />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.subHeader}>GPS Location</Text>
                {errorMsg ? <Text>{errorMsg}</Text> : null}
                {location ? (
                    <View>
                        <Text>Latitude: {location.coords.latitude}</Text>
                        <Text>Longitude: {location.coords.longitude}</Text>
                    </View>
                ) : (
                    <Text>Waiting for location...</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.subHeader}>Battery</Text>
                <Text>Level: {batteryLevel ? (batteryLevel * 100).toFixed(0) + '%' : 'Loading...'}</Text>
                <Text>State: {batteryState === Battery.BatteryState.CHARGING ? 'Charging' :
                    batteryState === Battery.BatteryState.UNPLUGGED ? 'Unplugged' :
                        batteryState === Battery.BatteryState.FULL ? 'Full' : 'Unknown'}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 30,
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
    },
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    buttonContainer: {
        marginTop: 10,
    }
});
