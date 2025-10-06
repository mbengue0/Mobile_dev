# React Native State Management & Navigation

# Exercise 1: Timer App

Task: Create a timer component that shows elapsed seconds.

```js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function TimerComponent() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // TODO: Add useEffect to increment seconds every 1000ms when isRunning is true
  // Hint: Use setInterval and remember to clear it in the cleanup function

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
```

# Exercise 2
Task: Create a component that fetches user data from an API.

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: Add useEffect to fetch user data from:
  // https://jsonplaceholder.typicode.com/users/1
  // Handle loading, success, and error states

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.phone}>{user?.phone}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  phone: {
    fontSize: 16,
    color: '#666',
  },
});
```
# Exercise 3: Shopping Cart
## Context API + Tab Navigation

### What to Build
- Products list with "Add to Cart" buttons
- Shopping cart with quantity controls
- Global cart state using Context API
- Tab badge showing cart item count

### File Structure
```
contexts/
└── CartContext.tsx

app/
├── _layout.tsx
└── (tabs)/
    ├── _layout.tsx
    ├── index.tsx       # Products
    └── cart.tsx        # Cart
```

### Requirements

**Cart Context (`contexts/CartContext.tsx`):**

Create types:
```tsx
Product: { id, name, price, image }
CartItem: Product & { quantity }
```

Context should provide:
- `cart` state (array of CartItems)
- `addToCart(product)` - add or increase quantity
- `removeFromCart(productId)` - remove item
- `updateQuantity(productId, quantity)` - change quantity
- `clearCart()` - empty cart
- `getTotal()` - calculate total price
- `getItemCount()` - sum all quantities

Use `useState` for cart array

**Root Layout (`app/_layout.tsx`):**
- Wrap with CartProvider

**Tab Layout (`app/(tabs)/_layout.tsx`):**
- Two tabs: Products and Cart
- Use `useCart()` hook
- Show badge on Cart tab with item count
- Icons: shopping-bag and shopping-cart

**Products Screen (`app/(tabs)/index.tsx`):**
- Hardcode 6 products (use emojis for images)
- Display in 2-column grid (FlatList with numColumns={2})
- Each card shows: emoji, name, price, "Add to Cart" button
- Call `addToCart()` when button pressed
- Show alert confirming item added

**Cart Screen (`app/(tabs)/cart.tsx`):**
- If empty: show empty state with icon
- If has items: show list of cart items
- Each item shows: emoji, name, price, quantity controls
- Quantity controls: minus button, number, plus button
- Remove button on each item
- Show total at bottom
- "Clear Cart" and "Checkout" buttons

### Expected Behavior
- Adding item increases quantity if already in cart
- Tab badge updates automatically
- Quantity controls update immediately
- Total recalculates on any change
- Cart state persists across tab switches
- Checkout button shows alert with total

---
