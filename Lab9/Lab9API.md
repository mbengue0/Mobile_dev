
# Lab 9 : API

## Exercise 1 : Data Fetching with Dependencies
Create a component that fetches posts based on selected user and displays both user info and their posts.

## Requirements:
- Fetch users first
- When a user is selected, fetch their posts
- Use proper dependency management in useEffect
- Handle loading states for both requests
```js
import React, { useState, useEffect } from 'react';
import { View, Text, Picker, FlatList, ActivityIndicator, StyleSheet } from 'react-native';

const UserPosts = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    // Your users fetch logic
  }, []);

  // Fetch posts when selectedUser changes
  useEffect(() => {
    // Your posts fetch logic (dependent on selectedUser)
  }, [selectedUser]);

  return (
    <View style={styles.container}>
      <Text>Select a User:</Text>
      <Picker
        selectedValue={selectedUser}
        onValueChange={(itemValue) => setSelectedUser(itemValue)}
      >
        <Picker.Item label="Select a user..." value={null} />
        {users.map(user => (
          <Picker.Item key={user.id} label={user.name} value={user.id} />
        ))}
      </Picker>

      {loadingPosts && <ActivityIndicator />}
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.postItem}>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text>{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  postItem: { marginBottom: 15, padding: 10, backgroundColor: '#f5f5f5' },
  postTitle: { fontWeight: 'bold', marginBottom: 5 }
});

export default UserPosts;
```

# useEffect Dependency Masterclass: 

## Learning Objectives
By the end of this exercise, you will understand:
- How different dependency arrays affect useEffect behavior
- When to use empty, specific, or no dependencies
- Common pitfalls and best practices
- Real-world use cases for each pattern

---

## Setup Instructions

First, create a new React Native component:

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';

const UseEffectDemo = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Alice');
  const [renderCount, setRenderCount] = useState(0);

  // We'll add different useEffects here

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>useEffect Dependency Demo</Text>
      
      <View style={styles.section}>
        <Text>Count: {count}</Text>
        <Button title="Increment Count" onPress={() => setCount(c => c + 1)} />
      </View>

      <View style={styles.section}>
        <Text>Name: {name}</Text>
        <Button 
          title="Toggle Name" 
          onPress={() => setName(n => n === 'Alice' ? 'Bob' : 'Alice')} 
        />
      </View>

      <Text style={styles.renderCount}>Component rendered: {renderCount} times</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 20, padding: 10, backgroundColor: '#f0f0f0' },
  renderCount: { marginTop: 20, fontStyle: 'italic' }
});

export default UseEffectDemo;
```

---

## Exercise 1: Empty Dependency Array `[]`

###  Code to Add:
```javascript
// Effect 1: Empty dependencies
useEffect(() => {
  console.log('🔄 Effect 1: Runs ONCE after initial render');
  setRenderCount(r => r + 1);
}, []); // Empty dependency array
```

### Questions:
1. **When will this effect run?**
   - Try it: How many times do you see the console log when you:
     - Load the component?
     - Click "Increment Count"?
     - Click "Toggle Name"?

2. **What's the practical use case?**
   - Think about when you'd use this pattern in a real app

### 💡 Expected Understanding:
```javascript
// Real-world examples:
useEffect(() => {
  // ✅ Fetch initial data when component mounts
  fetchUserProfile();
  
  // ✅ Initialize analytics
  analytics.track('Screen Viewed');
  
  // ✅ Set up event listeners that should never change
  // (though cleanup is still important!)
}, []);
```

---

## Exercise 2: No Dependency Array

### Code to Add:
```javascript
// Effect 2: No dependency array
useEffect(() => {
  console.log('🎯 Effect 2: Runs after EVERY render');
  // Warning: This will cause infinite re-renders if you update state!
  // setRenderCount(r => r + 1); // ⚠️ DON'T uncomment this!
});
```

### Questions:
1. **How often does this effect run?**
   - Watch the console as you interact with the component

2. **Why is this pattern dangerous?**
   - What happens if you update state inside this effect?

3. **When would you actually use this?**
   - Think about scenarios where you need to run code after every render

### Expected Understanding:
```javascript
// Rare but valid use cases:
useEffect(() => {
  // ✅ Update document title on every render (web)
  document.title = `You have ${unreadCount} messages`;
  
  // ✅ Analytics tracking for every interaction
  // (but be careful about performance!)
});

// ⚠️ Usually, you want specific dependencies instead!
```

---

## Exercise 3: Specific Dependencies `[count]`

### Code to Add:
```javascript
// Effect 3: Specific dependency
useEffect(() => {
  console.log('🎯 Effect 3: Runs when count changes', count);
  
  // This is safe because we're not causing re-renders
  if (count > 5) {
    console.log('🎉 Count is greater than 5!');
  }
}, [count]); // Only depends on count
```

### Questions:
1. **When does this effect execute?**
   - Click "Increment Count" multiple times
   - Click "Toggle Name" - does it run?

2. **What happens if we add multiple dependencies?**
   - Try changing to `[count, name]` and observe the behavior

---

## Exercise 4: Missing Dependencies (Common Mistake)

###  Code to Add:
```javascript
// Effect 4: Missing dependency (ESLint would warn about this, if configured!)
useEffect(() => {
  console.log('❌ Effect 4: Using count without declaring dependency', count);
  // We're using count but it's not in dependencies!
}, []); // Missing count dependency
```

###  Questions:
1. **What's wrong with this effect?**
   - What value of `count` will you see in the console?
   - Why is this a bug waiting to happen?

2. **How can we fix it?**
   - Add `count` to the dependency array
   - Observe the behavior when you do

---

## Exercise 5: Cleanup Function

### Code to Add:
```javascript
// Effect 5: With cleanup
useEffect(() => {
  console.log('🔔 Effect 5: Started interval');
  
  const interval = setInterval(() => {
    console.log('Interval tick - current count:', count);
  }, 2000);
  
  // Cleanup function
  return () => {
    console.log('🧹 Effect 5: Cleanup - clearing interval');
    clearInterval(interval);
  };
}, [count]); // Re-create interval when count changes
```

### Questions:
1. **When is the cleanup function called?**
   - Watch the console when:
     - Count changes
     - Component unmounts (you'll need to navigate away)

2. **Why do we need cleanup?**
   - What happens if we don't clear the interval?

3. **How does the dependency array affect cleanup?**
