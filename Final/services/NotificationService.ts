import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface NotificationData {
    type: 'ticket_purchase' | 'wallet_topup' | 'system_alert' | 'meal_reminder';
    [key: string]: any;
}

class NotificationService {
    /**
     * Request notification permissions from the user
     */
    async requestPermissions(): Promise<boolean> {
        if (!Device.isDevice) {
            console.log('Notifications only work on physical devices');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return false;
        }

        return true;
    }

    /**
     * Get the Expo push token for this device
     */
    async getPushToken(): Promise<string | null> {
        try {
            if (!Device.isDevice) {
                console.log('Push notifications only work on physical devices');
                return null;
            }

            // For local development, we can skip the projectId
            // In production, you would configure this in app.json under extra.eas.projectId
            const token = await Notifications.getExpoPushTokenAsync();

            return token.data;
        } catch (error) {
            // Silently fail in development - local notifications still work
            // In production with a proper EAS project, this would succeed
            return null;
        }
    }

    /**
     * Register push token with the database
     */
    async registerPushToken(userId: string, token: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    push_token: token,
                    notifications_enabled: true
                })
                .eq('id', userId);

            if (error) {
                console.error('Error registering push token:', error);
            } else {
                console.log('Push token registered successfully');
            }
        } catch (error) {
            console.error('Error in registerPushToken:', error);
        }
    }

    /**
     * Send a local notification (instant feedback, no server required)
     */
    async sendLocalNotification(
        title: string,
        body: string,
        data?: NotificationData
    ): Promise<void> {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: data || {},
                    sound: true,
                },
                trigger: null, // Show immediately
            });
        } catch (error) {
            console.error('Error sending local notification:', error);
        }
    }

    /**
     * Log notification to database
     */
    async logNotification(
        userId: string,
        title: string,
        body: string,
        type: string,
        data?: any
    ): Promise<void> {
        try {
            await supabase.rpc('log_notification', {
                p_user_id: userId,
                p_title: title,
                p_body: body,
                p_type: type,
                p_data: data || null,
            });
        } catch (error) {
            console.error('Error logging notification:', error);
        }
    }

    /**
     * Update notification preference
     */
    async updateNotificationPreference(
        userId: string,
        enabled: boolean
    ): Promise<void> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ notifications_enabled: enabled })
                .eq('id', userId);

            if (error) {
                console.error('Error updating notification preference:', error);
            }
        } catch (error) {
            console.error('Error in updateNotificationPreference:', error);
        }
    }

    /**
     * Check if notifications are enabled for user
     */
    async areNotificationsEnabled(userId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('notifications_enabled')
                .eq('id', userId)
                .single();

            if (error || !data) {
                return true; // Default to enabled
            }

            return data.notifications_enabled ?? true;
        } catch (error) {
            console.error('Error checking notification status:', error);
            return true;
        }
    }

    /**
     * Configure notification channels (Android only)
     */
    async configureNotificationChannels(): Promise<void> {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF4757',
            });

            await Notifications.setNotificationChannelAsync('tickets', {
                name: 'Ticket Notifications',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF4757',
            });

            await Notifications.setNotificationChannelAsync('wallet', {
                name: 'Wallet Notifications',
                importance: Notifications.AndroidImportance.DEFAULT,
                vibrationPattern: [0, 250],
                lightColor: '#4CAF50',
            });
        }
    }
    /**
     * Send a remote push notification via Expo API
     * Note: In a production app, this should ideally be done from a backend server
     * to protect API keys (if any) and ensure reliability.
     */
    async sendPushNotification(
        expoPushToken: string,
        title: string,
        body: string,
        data?: NotificationData
    ): Promise<void> {
        try {
            const message = {
                to: expoPushToken,
                sound: 'default',
                title: title,
                body: body,
                data: data || {},
            };

            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });

            const result = await response.json();

            if (result.errors) {
                console.error('Expo Push API Error:', result.errors);
            } else {
                console.log('Push Notification Sent:', result.data);
            }
        } catch (error) {
            console.error('Error sending push notification:', error);
        }
    }
}

export default new NotificationService();
