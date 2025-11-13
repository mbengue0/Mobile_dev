import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SearchBar({ value, onChangeText, placeholder = 'Search in mail' }) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="search" size={20} color="#666" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#888"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 12,
    borderRadius: 8,
    backgroundColor: '#F1F3F4',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 4,
    color: '#111',
  },
});


