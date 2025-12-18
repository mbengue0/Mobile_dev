import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text testID="count-text" style={styles.text}>{count}</Text>
      <Button title="Increment" onPress={() => setCount(count + 1)} testID="increment-button" />
      <Button title="Decrement" onPress={() => setCount(count - 1)} testID="decrement-button" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 10,
  },
});
