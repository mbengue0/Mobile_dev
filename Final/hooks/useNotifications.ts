import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import NotificationService from '../services/NotificationService';
import { useAuth } from './useAuth';

export function useNotifications() {
    const { user } = useAuth();
    const router = useRouter();
    const notificationListener = useRef<any>();
    const responseListener = useRef<any>();

    useEffect(() => {
        // Initialize notifications when user is authenticated
        if (user) {
            initializeNotifications();
        }

        // Set up notification listeners
        notificationListener.current = Notifications.addNotificationReceivedListener(
            handleNotificationReceived
        );

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            handleNotificationResponse
        );

        // Cleanup listeners on unmount
        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [user]);

    /**
     * Initialize notification system
     */
    const initializeNotifications = async () => {
        if (!user) return;

        try {
            // Configure notification channels (Android)
            await NotificationService.configureNotificationChannels();

            // Request permissions
            const hasPermission = await NotificationService.requestPermissions();

            if (hasPermission) {
                // Get and register push token
                const token = await NotificationService.getPushToken();
                if (token) {
                    await NotificationService.registerPushToken(user.id, token);
                }
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    };

    /**
     * Handle notification received while app is in foreground
     */
    const handleNotificationReceived = (notification: Notifications.Notification) => {
        console.log('Notification received:', notification);
        // Notification will be displayed automatically due to our handler configuration
    };

    /**
     * Handle user tapping on a notification
     */
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);

        // Navigate based on notification type
        if (data.type === 'ticket_purchase') {
            router.push('/(student)/tickets');
        } else if (data.type === 'wallet_topup') {
            router.push('/(student)/wallet');
        } else if (data.type === 'system_alert') {
            // Could navigate to a notifications screen
        }
    };

    /**
     * Send a notification (wrapper for convenience)
     */
    const sendNotification = async (
        title: string,
        body: string,
        type: 'ticket_purchase' | 'wallet_topup' | 'system_alert' | 'meal_reminder',
        additionalData?: any
    ) => {
        if (!user) return;

        // Check if notifications are enabled for this user
        const enabled = await NotificationService.areNotificationsEnabled(user.id);
        if (!enabled) {
            console.log('Notifications disabled for user');
            return;
        }

        // Send local notification
        await NotificationService.sendLocalNotification(title, body, {
            type,
            ...additionalData,
        });

        // Log to database
        await NotificationService.logNotification(
            user.id,
            title,
            body,
            type,
            additionalData
        );
    };

    return {
        sendNotification,
        initializeNotifications,
    };
}
