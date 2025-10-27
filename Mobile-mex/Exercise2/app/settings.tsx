import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
        <Text style={[styles.settingText, { color: theme.text }]}>Notifications</Text>
        <Text style={[styles.settingValue, { color: theme.text }]}>Enabled</Text>
      </View>

      <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
        <Text style={[styles.settingText, { color: theme.text }]}>Language</Text>
        <Text style={[styles.settingValue, { color: theme.text }]}>English</Text>
      </View>

      <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
        <Text style={[styles.settingText, { color: theme.text }]}>Privacy</Text>
        <Text style={[styles.settingValue, { color: theme.text }]}>Public</Text>
      </View>

      <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
        <View style={styles.themeRow}>
          <View>
            <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
            <Text style={[styles.currentMode, { color: theme.text }]}>
              Currently: {isDark ? 'Dark' : 'Light'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  settingItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 14,
  },
  themeRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentMode: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});