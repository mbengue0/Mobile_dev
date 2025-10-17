import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { initDb } from '../src/services/dbService';
import { AuthService } from '../src/services/authService';
import LoginScreen from '../src/screens/LoginScreen';
import HomeScreen from '../src/screens/HomeScreen';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await initDb();
      
      // Check authentication status
      const authenticated = await AuthService.isAuthenticated();
      const pinExists = await AuthService.hasPin();
      
      setIsLoggedIn(authenticated || pinExists);
      setHasPin(pinExists);
    } catch (error) {
      console.error('App initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleSetPin = () => {
    setHasPin(true);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setHasPin(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading Notes App...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <HomeScreen onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} onSetPin={handleSetPin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
});