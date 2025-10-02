import React, { useState } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity  } from "react-native";

export default function Count() {
// TODO: Add useState for count
    const [count, setCount] = useState(0);
  
  // TODO: Add increment function
    const increment = () => {
        setCount(count + 1);
    };
  
  // TODO: Add decrement function
    const decrement = () => {
        setCount(count - 1);
    };
  
  // TODO: Add reset function
    const reset = () => {
        setCount(0);
    }
  
  return (
    <View style={styles.container}>
      {/* TODO: Display count */}
        <Text style={styles.countText}>Count: {count}</Text>
      {/* TODO: Add buttons */}
      <TouchableOpacity style={styles.button} onPress={increment}>Incrementing</TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={decrement}></TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={reset}></TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
    
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

