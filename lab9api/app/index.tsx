import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import UserPosts from './components/UserPosts';
import UseEffectDemo from './components/useEffectDemo';

type Screen = 'menu' | 'userPosts' | 'useEffectDemo';

export default function App(): React.ReactElement {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');

  const renderScreen = (): React.ReactElement => {
    switch (currentScreen) {
      case 'userPosts':
        return <UserPosts />;
      case 'useEffectDemo':
        return <UseEffectDemo />;
      default:
        return (
          <View style={styles.menu}>
            <Text style={styles.title}>API & useEffect Lab</Text>
            <Text style={styles.subtitle}>TypeScript Version</Text>
            <View style={styles.buttonContainer}>
              <Button 
                title="Exercise 1: User Posts" 
                onPress={() => setCurrentScreen('userPosts')}
              />
              <View style={styles.spacer} />
              <Button 
                title="Exercise 2: useEffect Demo" 
                onPress={() => setCurrentScreen('useEffectDemo')}
              />
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {currentScreen !== 'menu' && (
        <Button 
          title="← Back to Menu" 
          onPress={() => setCurrentScreen('menu')}
          color="#666"
        />
      )}
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff'
  },
  menu: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40
  },
  buttonContainer: {
    width: '80%'
  },
  spacer: {
    height: 20
  }
});