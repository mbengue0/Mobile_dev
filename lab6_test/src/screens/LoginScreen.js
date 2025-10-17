import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthService } from '../services/authService';

const LoginScreen = ({ onLogin, onSetPin }) => {
  const [apiToken, setApiToken] = useState('');
  const [pin, setPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);

  const handleSetPin = async () => {
    if (pin.length < 4) {
      alert('PIN must be at least 4 digits');
      return;
    }
    
    const success = await AuthService.saveCredential('notes_app_pin', pin);
    if (success) {
      alert('PIN set successfully!');
      onSetPin();
    }
  };

  const handleLoginWithToken = async () => {
    if (!apiToken.trim()) {
      alert('Please enter an API token');
      return;
    }
    
    const success = await AuthService.saveCredential('notes_api_token', apiToken);
    if (success) {
      onLogin();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notes App</Text>
      <Text style={styles.subtitle}>Secure Your Notes</Text>
      
      {!isSettingPin ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Token</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your API token"
            value={apiToken}
            onChangeText={setApiToken}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLoginWithToken}>
            <Text style={styles.buttonText}>Save Token & Continue</Text>
          </TouchableOpacity>
          
          <Text style={styles.divider}>OR</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => setIsSettingPin(true)}
          >
            <Text style={styles.secondaryButtonText}>Set App PIN Instead</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set App PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 4-digit PIN"
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
          />
          <TouchableOpacity style={styles.button} onPress={handleSetPin}>
            <Text style={styles.buttonText}>Set PIN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => setIsSettingPin(false)}
          >
            <Text style={styles.secondaryButtonText}>Back to Token</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#999',
    fontWeight: 'bold',
  },
});

export default LoginScreen;