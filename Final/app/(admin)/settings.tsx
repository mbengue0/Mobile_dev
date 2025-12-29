import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Switch,
    Modal,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NotificationService from '../../services/NotificationService';

export default function SettingsScreen() {
    const { user, profile, signOut } = useAuth();
    const router = useRouter();

    const [notificationsEnabled, setNotificationsEnabled] = useState(
        profile?.notifications_enabled ?? true
    );
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    const handleNotificationToggle = async (value: boolean) => {
        setNotificationsEnabled(value);

        // Persist to database
        if (user) {
            await NotificationService.updateNotificationPreference(user.id, value);
        }

        Alert.alert(
            'Notifications',
            value ? 'Notifications enabled' : 'Notifications disabled',
            [{ text: 'OK' }]
        );
    };

    const handleDarkModeToggle = (value: boolean) => {
        setDarkModeEnabled(value);
        Alert.alert(
            'Dark Mode',
            'Dark mode will be available in a future update',
            [{ text: 'OK' }]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={80} color="#FF4757" />
                </View>
                <Text style={styles.name}>{profile?.full_name || 'Admin User'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                        {profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setShowProfileModal(true)}
                >
                    <Ionicons name="person-outline" size={24} color="#666" />
                    <Text style={styles.menuText}>Profile Information</Text>
                    <Ionicons name="chevron-forward" size={24} color="#ccc" />
                </TouchableOpacity>

                {profile?.role === 'super_admin' && (
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/(super_admin)/users')}
                    >
                        <Ionicons name="shield-checkmark-outline" size={24} color="#666" />
                        <Text style={styles.menuText}>Super Admin Dashboard</Text>
                        <Ionicons name="chevron-forward" size={24} color="#ccc" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>

                <View style={styles.menuItem}>
                    <Ionicons name="notifications-outline" size={24} color="#666" />
                    <Text style={styles.menuText}>Notifications</Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={handleNotificationToggle}
                        trackColor={{ false: '#ccc', true: '#FF4757' }}
                        thumbColor="#fff"
                    />
                </View>

                <View style={styles.menuItem}>
                    <Ionicons name="moon-outline" size={24} color="#666" />
                    <Text style={styles.menuText}>Dark Mode</Text>
                    <Switch
                        value={darkModeEnabled}
                        onValueChange={handleDarkModeToggle}
                        trackColor={{ false: '#ccc', true: '#FF4757' }}
                        thumbColor="#fff"
                    />
                </View>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Ionicons name="log-out-outline" size={24} color="#fff" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.version}>UniTicket v1.0.0</Text>

            {/* Profile Information Modal */}
            <Modal
                visible={showProfileModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowProfileModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Profile Information</Text>
                            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.profileInfo}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Full Name</Text>
                                <Text style={styles.infoValue}>{profile?.full_name || 'N/A'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{user?.email}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Role</Text>
                                <Text style={styles.infoValue}>
                                    {profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                </Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>User ID</Text>
                                <Text style={[styles.infoValue, styles.monospace]}>
                                    {user?.id?.substring(0, 8)}...
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowProfileModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    profileSection: {
        backgroundColor: '#fff',
        padding: 30,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatarContainer: {
        marginBottom: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    email: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    roleBadge: {
        backgroundColor: '#FF4757',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#f5f5f5',
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF3B30',
        margin: 20,
        padding: 15,
        borderRadius: 12,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    version: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginBottom: 30,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 20,
        minHeight: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    profileInfo: {
        marginTop: 10,
    },
    infoRow: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 5,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
    },
    monospace: {
        fontFamily: 'monospace',
    },
    closeButton: {
        backgroundColor: '#FF4757',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
