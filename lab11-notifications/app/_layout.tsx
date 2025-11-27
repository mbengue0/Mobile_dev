import { Stack } from "expo-router";
import * as Notifications from 'expo-notifications';
import { useEffect } from "react";

// 1. Setup the notification handler
// This determines what happens when a notification is received while the app is OPEN.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  // Request permissions on app start (optional, but good practice)
  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to send notifications is required!');
      }
    }
    requestPermissions();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Lab 11: Menu" }} />
      <Stack.Screen name="exercise1" options={{ title: "Ex 1: Local Reminder" }} />
      <Stack.Screen name="exercise2" options={{ title: "Ex 2: Push Promo" }} />
    </Stack>
  );
}