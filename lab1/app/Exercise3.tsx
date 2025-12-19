import { useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";

export function Exercise3() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text style={{ color: count % 2 === 0 ? 'green' : 'red' }}>
        {count}
      </Text>
      
      <Button
        title="Increment"
        onPress={() => setCount(count + 1)}
      />
      
      <TouchableOpacity
        style={{
          backgroundColor: 'blue',
          padding: 10,
          borderRadius: 5,
        }}
        onPress={() => setCount(count + 1)}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Increment
        </Text>
      </TouchableOpacity>
    </View>
  );
}