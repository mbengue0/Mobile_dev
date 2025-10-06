import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function TimerComponent() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // TODO: Add useEffect to increment seconds every 1000ms when isRunning is true
   // useEffect to increment seconds every 1000ms when isRunning is true
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    }

    // Cleanup function to clear the interval when component unmounts or isRunning changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]); 

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{seconds}s</Text>
      <Button
        title={isRunning ? 'Stop' : 'Start'}
        onPress={() => setIsRunning(!isRunning)}
      />
      <Button title="Reset" onPress={() => setSeconds(0)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
  },
});