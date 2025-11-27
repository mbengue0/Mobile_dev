import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function Exercise1() {
  const [scheduled, setScheduled] = useState(false);

  const scheduleWaterReminder = async () => {
    // 1. Check permissions
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert("Permission Required", "Please enable notifications to use this feature.");
        return;
      }
    }

    // 2. Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hydration Check 💧",
        body: "It's been 5 seconds! Time to drink a glass of water.",
        sound: true,
      },
      // FIX: Added 'repeats: false' to ensure strict typing works
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5, // 5 seconds
        repeats: false,
      },
    });

    setScheduled(true);
    Alert.alert("Reminder Set", "I'll remind you to drink water in 5 seconds!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Health Tracker</Text>
      <Text style={styles.subText}>
        Stay hydrated to keep your mind sharp for coding!
      </Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title={scheduled ? "Reminder Active ✅" : "Remind me in 5 seconds"} 
          onPress={scheduleWaterReminder} 
          color="#007AFF"
        />
      </View>
      
      {scheduled && (
        <Text style={styles.infoText}>
          You can exit the app. The notification will arrive shortly.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  subText: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#666' },
  buttonContainer: { width: '100%', marginBottom: 20 },
  infoText: { marginTop: 20, fontSize: 12, color: '#888', fontStyle: 'italic' },
});