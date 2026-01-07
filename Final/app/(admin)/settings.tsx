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
    StatusBar
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NotificationService from '../../services/NotificationService';
import { useTheme } from '../../providers/ThemeProvider';

export default function SettingsScreen() {
    const { user, profile, signOut } = useAuth();
    const router = useRouter();
    const { colors, isDarkMode, toggleTheme } = useTheme();

    const [notificationsEnabled, setNotificationsEnabled] = useState(
        profile?.notifications_enabled ?? true
    );
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
        if (user) {
            await NotificationService.updateNotificationPreference(user.id, value);
        }
    };

    const styles = getStyles(colors);

    return (
        <ScrollView style={styles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={80} color={colors.primary} />
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
                    <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
                    <Text style={styles.menuText}>Profile Information</Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.border} />
                </TouchableOpacity>

                {profile?.role === 'super_admin' && (
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/(super_admin)/users')}
                    >
                        <Ionicons name="shield-checkmark-outline" size={24} color={colors.textSecondary} />
                        <Text style={styles.menuText}>Super Admin Dashboard</Text>
                        <Ionicons name="chevron-forward" size={24} color={colors.border} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>

                <View style={styles.menuItem}>
                    <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
                    <Text style={styles.menuText}>Notifications</Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={handleNotificationToggle}
                        trackColor={{ false: '#ccc', true: colors.primary }}
                        thumbColor="#fff"
                    />
                </View>

                <View style={styles.menuItem}>
                    <Ionicons name="moon-outline" size={24} color={colors.textSecondary} />
                    <Text style={styles.menuText}>Dark Mode</Text>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#ccc', true: colors.primary }}
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

            <Text style={styles.version}>Kanteen v1.0.2</Text>

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
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.profileInfo}>
                            <InfoRow label="Full Name" value={profile?.full_name || 'N/A'} colors={colors} />
                            <InfoRow label="Email" value={user?.email} colors={colors} />
                            <InfoRow
                                label="Role"
                                value={profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                colors={colors}
                            />
                            <InfoRow
                                label="User ID"
                                value={`${user?.id?.substring(0, 8)}...`}
                                colors={colors}
                                monospace
                            />
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

const InfoRow = ({ label, value, colors, monospace }: any) => (
    <View style={[stylesRaw.infoRow, { borderBottomColor: colors.border }]}>
        <Text style={[stylesRaw.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[
            stylesRaw.infoValue,
            { color: colors.text },
            monospace && stylesRaw.monospace
        ]}>{value}</Text>
    </View>
);

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    profileSection: {
        backgroundColor: colors.card,
        padding: 30,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    avatarContainer: {
        marginBottom: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 5,
    },
    email: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 10,
    },
    roleBadge: {
        backgroundColor: colors.primary,
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
        backgroundColor: colors.card,
        marginTop: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: colors.background,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        marginLeft: 15,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.danger,
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
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: 30,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.card,
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
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
    },
    profileInfo: {
        marginTop: 10,
    },
    closeButton: {
        backgroundColor: colors.primary,
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

const stylesRaw = StyleSheet.create({
    infoRow: {
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    infoLabel: {
        fontSize: 13,
        marginBottom: 5,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 16,
    },
    monospace: {
        fontFamily: 'monospace',
    },
});
