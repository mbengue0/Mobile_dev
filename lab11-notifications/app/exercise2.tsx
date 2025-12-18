import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './utils/registerForPushNotificationsAsync';

// 1. GLOBAL HANDLER: Needs to be OUTSIDE the component
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Exercise2() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  
  // 2. REFS: Initialize with 'undefined' to fix TypeScript errors
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // A. Register
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token ?? ''));

    // B. Listener (Foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // C. Listener (Interaction/Background)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      setNotification(response.notification);
    });

    return () => {
      // 3. CLEANUP FIX: Use .remove() directly on the ref
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sea Plaza Promotions 🛍️</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Your Expo Push Token:</Text>
        <Text selectable style={styles.token}>{expoPushToken || "Fetching token..."}</Text>
      </View>

      <Text style={styles.instruction}>
        1. Copy the token above.
        2. Go to: https://expo.dev/notifications
        3. Enter token and JSON Data:
        {`\n{"store": "Sea Plaza", "discount": "50%"}`}
      </Text>

      {/* Display Notification Data */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Latest Message:</Text>
        
        {notification ? (
          <View style={styles.promoBox}>
            <Text style={styles.promoHeader}>
              {notification.request.content.title}
            </Text>
            <Text style={styles.promoBody}>
              {notification.request.content.body}
            </Text>
            <Text style={styles.promoData}>
              {/* Safely print JSON data */}
              Custom Data: {JSON.stringify(notification.request.content.data, null, 2)}
            </Text>
          </View>
        ) : (
          <Text style={styles.waitingText}>Waiting for notification...</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50', textAlign: 'center' },
  card: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, width: '100%', marginBottom: 15 },
  label: { fontWeight: 'bold', marginBottom: 5, color: '#333' },
  token: { fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#555' },
  instruction: { fontSize: 14, color: '#7f8c8d', marginBottom: 30, textAlign: 'center' },
  statusContainer: { width: '100%', alignItems: 'center' },
  statusTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  promoBox: { 
    width: '100%', 
    padding: 20, 
    backgroundColor: '#e8f8f5', 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#1abc9c',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  promoHeader: { fontSize: 20, fontWeight: 'bold', color: '#16a085', marginBottom: 8 },
  promoBody: { fontSize: 16, color: '#2c3e50', marginBottom: 10 },
  promoData: { fontSize: 12, color: '#7f8c8d', fontStyle: 'italic', marginTop: 10 },
  waitingText: { fontSize: 16, color: '#bdc3c7', fontStyle: 'italic' }
});