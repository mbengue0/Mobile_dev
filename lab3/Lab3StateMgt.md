# Lab 3 State Management
## Exercise 1 : Simple Counter Component

Create a new component called Counter
Implement the following features:

- Display current count
- Increment button (+1)
- Decrement button (-1)
- Reset button

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Counter = () => {
  // TODO: Add useState for count
  
  // TODO: Add increment function
  
  // TODO: Add decrement function
  
  // TODO: Add reset function
  
  return (
    <View style={styles.container}>
      {/* TODO: Display count */}
      {/* TODO: Add buttons */}
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

export default Counter;
```

## Exercise 2 : Todo List with useState
Create a todo list component `TodoList`.
- Add new todos
- Toggle todo completion
- Delete todos
- Display total count
Complete the TodoList.js component:

```js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');

  const addTodo = () => {
    if (inputText.trim()) {
      // TODO: Add new todo to the list
      // Each todo should have: id, text, completed
      
      // TODO: Clear input
    }
  };

  const toggleTodo = (id) => {
    // TODO: Toggle the completed status of a todo
  };

  const deleteTodo = (id) => {
    // TODO: Remove todo from list
  };

  const renderTodo = ({ item }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity 
        style={[styles.todoText, item.completed && styles.completedTodo]}
        // TODO: Handle toggleTodo
      >
        <Text style={[styles.todoTextContent, item.completed && styles.completedText]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton}
        // TODO: Handle deleteTodo
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter a new todo"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.counter}>
        Total: {todos.length} | Completed: {todos.filter(t => t.completed).length}
      </Text>

      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
};

// Styles provided...
```

## Exercise 3 : User Registration Form (with udeReducer)

Create a complex form using useReducer to handle multiple input fields and validation.

- Complete the reducer cases
- Implement validation logic
- Create the form UI
- Handle form submission

`Hints:`
- Use spread operator to maintain immutability
- Validate email with regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Show errors below each input field
- Disable submit button when submitting

```js
import React, { useReducer } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const initialState = {
  formData: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  errors: {},
  isSubmitting: false,
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      // TODO: Update a specific field in formData
      // Clear any existing error for this field
      
    case 'SET_ERROR':
      // TODO: Set an error for a specific field
      
    case 'CLEAR_ERRORS':
      // TODO: Clear all errors
      
    case 'SET_SUBMITTING':
      // TODO: Set loading state
      
    case 'RESET_FORM':
      // TODO: Reset to initial state
      
    default:
      return state;
  }
};

const RegistrationForm = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const updateField = (field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const validateForm = () => {
    const { formData } = state;
    const errors = {};

    // TODO: Add validation logic
    // - Check required fields
    // - Validate email format
    // - Check password length (min 6 chars)
    // - Confirm passwords match

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERROR', errors });
      return false;
    }

    dispatch({ type: 'CLEAR_ERRORS' });
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });

    // Simulate API call
    setTimeout(() => {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
      Alert.alert('Success', 'Registration completed!');
      dispatch({ type: 'RESET_FORM' });
    }, 2000);
  };

  // TODO: Render form UI
};
```
