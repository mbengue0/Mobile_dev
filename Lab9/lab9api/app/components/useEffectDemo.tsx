import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';

const UseEffectDemo: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [name, setName] = useState<string>('Alice');
  const [renderCount, setRenderCount] = useState<number>(0);
  const [effect6Active, setEffect6Active] = useState<boolean>(false);

  // Effect 1: Empty dependency array
  useEffect(() => {
    console.log('🔄 Effect 1: Runs ONCE after initial render');
    setRenderCount(r => r + 1);
  }, []);

  // Effect 2: No dependency array
  useEffect(() => {
    console.log('🎯 Effect 2: Runs after EVERY render');
    // Don't update state here or it will cause infinite re-renders!
  });

  // Effect 3: Specific dependency
  useEffect(() => {
    console.log('🎯 Effect 3: Runs when count changes', count);
    
    if (count > 5) {
      console.log('🎉 Count is greater than 5!');
    }
  }, [count]);

  // Effect 4: Multiple dependencies
  useEffect(() => {
    console.log('📝 Effect 4: Runs when count OR name changes');
    console.log(`Current values - Count: ${count}, Name: ${name}`);
  }, [count, name]);

  // Effect 5: Missing dependency (intentional bug)
  useEffect(() => {
    console.log('❌ Effect 5: Using count without declaring dependency', count);
  }, []); // Missing count dependency - this is a bug!

  // Effect 6: With cleanup
  useEffect(() => {
    if (!effect6Active) return;

    console.log('🔔 Effect 6: Started interval');
    
    const interval = setInterval(() => {
      console.log('Interval tick - current count:', count);
    }, 2000);
    
    // Cleanup function
    return () => {
      console.log('🧹 Effect 6: Cleanup - clearing interval');
      clearInterval(interval);
    };
  }, [effect6Active, count]);

  const resetDemo = (): void => {
    setCount(0);
    setName('Alice');
    setEffect6Active(false);
    Alert.alert('Demo Reset', 'All values have been reset to initial state.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>useEffect Dependency Demo</Text>
      <Text style={styles.subtitle}>Watch your console for effect logs!</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Counter State</Text>
        <Text style={styles.value}>Count: {count}</Text>
        <Button title="Increment Count" onPress={() => setCount(c => c + 1)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Name State</Text>
        <Text style={styles.value}>Name: {name}</Text>
        <Button 
          title="Toggle Name" 
          onPress={() => setName(n => n === 'Alice' ? 'Bob' : 'Alice')} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interval Effect (with cleanup)</Text>
        <Text style={styles.value}>
          Interval: {effect6Active ? 'ACTIVE' : 'INACTIVE'}
        </Text>
        <Button 
          title={effect6Active ? "Stop Interval" : "Start Interval"} 
          onPress={() => setEffect6Active(!effect6Active)} 
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Effect Explanations:</Text>
        <Text style={styles.infoText}>• Effect 1: Runs once on mount</Text>
        <Text style={styles.infoText}>• Effect 2: Runs after every render</Text>
        <Text style={styles.infoText}>• Effect 3: Runs only when count changes</Text>
        <Text style={styles.infoText}>• Effect 4: Runs when count OR name changes</Text>
        <Text style={styles.infoText}>• Effect 5: Bug - uses count but not in deps</Text>
        <Text style={styles.infoText}>• Effect 6: With cleanup (runs when active/count changes)</Text>
      </View>

      <Text style={styles.renderCount}>Component rendered: {renderCount} times</Text>
      
      <Button title="Reset Demo" onPress={resetDemo} color="#ff6b6b" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#fff'
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 5,
    textAlign: 'center',
    color: '#333'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic'
  },
  section: { 
    marginBottom: 20, 
    padding: 15, 
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4dabf7'
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#495057',
    fontSize: 16
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333'
  },
  infoSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107'
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#856404'
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#856404'
  },
  renderCount: { 
    marginTop: 20, 
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666',
    fontSize: 14
  }
});

export default UseEffectDemo;