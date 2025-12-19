import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Picker, StyleSheet } from 'react-native';

export  function AuthForm() {
  // State variables to store form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.formBox}>
        
        {/* Title */}
        <Text style={styles.title}>Login</Text>
        
        {/* Email Input */}
        <TextInput
          style={styles.textInput}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
        />
        
        {/* Password Input */}
        <TextInput
          style={styles.textInput}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        
        {/* Forgot Password Link */}
        <Text style={styles.forgotLink}>Forgot Password?</Text>
        
        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <Text>Select Role:</Text>
          <Picker
            selectedValue={role}
            onValueChange={setRole}
            style={styles.rolePicker}
          >
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Teacher" value="teacher" />
          </Picker>
        </View>
        
        {/* Remember Me Switch */}
        <View style={styles.rememberContainer}>
          <Text>Remember me</Text>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({

  mainContainer: {
    flex: 1,
    justifyContent: 'center',    
    alignItems: 'center',       
    backgroundColor: '#f0f0f0', 
    padding: 20,
  },
  
  formBox: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 10,
    width: '100%',
    maxWidth: 350,
  },
  
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  forgotLink: {
    textAlign: 'right',
    color: 'blue',
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  
  rolePicker: {
    flex: 1,
    marginLeft: 10,
  },
  
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  
  loginButton: {
    backgroundColor: '#2196F3', // Blue color
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});