import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../providers/ThemeProvider';

export default function ProfileScreen() {
    const { profile, signOut, user } = useAuth();
    const router = useRouter();
    const { colors, isDarkMode, toggleTheme } = useTheme();

    return (
        <ScrollView style={styles(colors).container}>
            <View style={styles(colors).header}>
                <TouchableOpacity onPress={() => router.back()} style={styles(colors).backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles(colors).title}>My Profile</Text>
            </View>

            <View style={styles(colors).content}>
                <View style={styles(colors).profileCard}>
                    <View style={styles(colors).avatarContainer}>
                        <Ionicons name="person-circle-outline" size={80} color={colors.primary} />
                    </View>
                    <Text style={styles(colors).name}>{profile?.full_name || 'Student'}</Text>
                    <Text style={styles(colors).role}>Student</Text>

                    <View style={styles(colors).infoSection}>
                        <View style={styles(colors).infoRow}>
                            <Text style={styles(colors).label}>Student ID</Text>
                            <Text style={styles(colors).value}>{profile?.student_id || 'N/A'}</Text>
                        </View>
                        <View style={styles(colors).divider} />
                        <View style={styles(colors).infoRow}>
                            <Text style={styles(colors).label}>Email</Text>
                            <Text style={styles(colors).value}>{profile?.email || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Settings Section */}
                <View style={[styles(colors).profileCard, { paddingVertical: 10 }]}>
                    <View style={styles(colors).settingRow}>
                        <View style={styles(colors).settingInfo}>
                            <Ionicons name="moon-outline" size={22} color={colors.text} />
                            <Text style={styles(colors).settingLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#ccc', true: colors.primary }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles(colors).logoutButton} onPress={signOut}>
                    <Ionicons name="log-out-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles(colors).logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        padding: 20,
        paddingTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        padding: 20,
    },
    profileCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
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
    role: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 20,
        textTransform: 'capitalize',
    },
    infoSection: {
        width: '100%',
        marginTop: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    label: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    // Settings styles
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 5,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    settingLabel: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    logoutButton: {
        backgroundColor: colors.danger,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
