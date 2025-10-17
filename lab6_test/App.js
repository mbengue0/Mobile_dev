import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lab 6 - Storage Test</Text>
      <Text style={styles.subtitle}>
        This app demonstrates local data persistence with:
      </Text>
      <Text style={styles.feature}>• AsyncStorage for settings</Text>
      <Text style={styles.feature}>• Secure Storage for credentials</Text>
      <Text style={styles.feature}>• SQLite for notes data</Text>
      <Text style={styles.note}>
        Check the app/index.tsx file to see the actual app
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    color: '#666',
  },
  feature: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  note: {
    fontSize: 12,
    marginTop: 20,
    color: '#999',
    textAlign: 'center',
  },
});