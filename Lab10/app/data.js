import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as LocalAuthentication from 'expo-local-authentication';

export default function DataScreen() {
    // Contacts
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        (async () => {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
                });

                if (data.length > 0) {
                    setContacts(data);
                }
            }
        })();
    }, []);

    // Biometrics
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleBiometricAuth = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) {
            Alert.alert('Error', 'Biometric hardware not available');
            return;
        }

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!isEnrolled) {
            Alert.alert('Error', 'No biometrics enrolled');
            return;
        }

        const result = await LocalAuthentication.authenticateAsync();
        if (result.success) {
            setIsAuthenticated(true);
            Alert.alert('Success', 'Authenticated successfully!');
        } else {
            setIsAuthenticated(false);
            Alert.alert('Failure', 'Authentication failed');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Biometrics</Text>
                <Text style={styles.status}>Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</Text>
                <Button title="Authenticate" onPress={handleBiometricAuth} />
            </View>

            <View style={[styles.section, { flex: 1 }]}>
                <Text style={styles.header}>Contacts</Text>
                {contacts.length > 0 ? (
                    <FlatList
                        data={contacts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.contactItem}>
                                <Text style={styles.contactName}>{item.name}</Text>
                                {item.phoneNumbers && item.phoneNumbers[0] && (
                                    <Text>{item.phoneNumbers[0].number}</Text>
                                )}
                            </View>
                        )}
                    />
                ) : (
                    <Text>No contacts found or permission denied.</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    section: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    status: {
        marginBottom: 10,
        fontSize: 16,
    },
    contactItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    contactName: {
        fontWeight: 'bold',
    }
});
