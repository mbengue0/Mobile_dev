import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    // 1. Get Project ID (Automatic method)
    // If this fails, you will see the log below.
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    console.log("Project ID found:", projectId);

    if (!projectId) {
      // IF THE CODE STOPS HERE: 
      // 1. Run 'npx eas init' in your terminal
      // 2. Copy the ID it generates
      // 3. Paste it inside the string below replacing 'your-project-id-here'
      // 4. Uncomment the line below:
      
      // return await getManualToken('your-project-id-here'); 
      
      alert('Project ID not found. Run "npx eas init" in your terminal.');
      return;
    }

    try {
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log("Push Token:", token);
    } catch (e) {
      console.error("Error fetching token:", e);
      token = `Error: ${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

// Helper for manual fallback if needed
async function getManualToken(projectId: string) {
    try {
        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log("Manual Push Token:", token);
        return token;
    } catch (e) {
        console.error(e);
        return null;
    }
}