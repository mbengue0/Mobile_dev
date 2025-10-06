# Lab4  Expo Router Navigation - Guided
## Building a Product Catalog App

In this exercise, you'll build a  mobile app (DaustShop) with multiple navigation patterns. You'll create a product catalog with tabs, stack navigation, and modal screens.


**Features:**
- Home screen with featured products
- Search/Browse products by category
- User profile with favorites
- Product details with reviews
- Shopping cart (modal)
- Settings screen


##  Part 1: Project Setup

Create a new expo Project by following these steps creating DaustShop app https://docs.expo.dev/router/installation/

## Part 2: Make sure we have the File Structure

Run `npm run reset-project` to clean the project from boilerplate code

### Task 2.1: Create App Folder and Files

We want this exact structure:

```
app/
├── _layout.tsx          # Root layout
├── (tabs)/              # Tab group folder
│   ├── _layout.tsx      # Tab navigator
│   ├── index.tsx        # Home tab
│   ├── browse.tsx       # Browse tab
│   └── profile.tsx      # Profile tab
├── product/
│   └── [id].tsx         # Product details (dynamic route)
├── cart.tsx             # Cart modal
└── +not-found.tsx       # 404 screen
```

### Task 2.2:  Root Layout

`app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

### Task 2.3: Found Screen

Create `app/+not-found.tsx`:

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404 - Screen Not Found</Text>
      <Link href="/" style={styles.link}>Go to Home</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  link: { color: '#007AFF', fontSize: 16 },
});
```

 Your file structure should match the one above exactly. Folder names with parentheses `(tabs)` are important!

---

##  Part 3: Build the Tab Structure

### Task 3.1: Create Tab Layout

Create `app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="search" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

 You should now see 3 tabs at the bottom. Test switching between them.

---

##  Part 4: Build the Home Screen

### Task 4.1: Create Home Screen with Product List

Create `app/(tabs)/index.tsx`:

```tsx
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const PRODUCTS = [
  { id: '1', name: 'Wireless Headphones', price: 79.99, category: 'Electronics' },
  { id: '2', name: 'Running Shoes', price: 129.99, category: 'Sports' },
  { id: '3', name: 'Coffee Maker', price: 89.99, category: 'Home' },
  { id: '4', name: 'Backpack', price: 49.99, category: 'Accessories' },
  { id: '5', name: 'Smart Watch', price: 299.99, category: 'Electronics' },
];

export default function HomeScreen() {
  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}?name=${item.name}&price=${item.price}`)}
    >
      <View style={styles.productIcon}>
        <FontAwesome name="cube" size={40} color="#007AFF" />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
      </View>
      <FontAwesome name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DaustShop</Text>
        <TouchableOpacity onPress={() => router.push('/cart')}>
          <FontAwesome name="shopping-cart" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Featured Products</Text>
      
      <FlatList
        data={PRODUCTS}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    padding: 20,
    paddingBottom: 10,
  },
  list: {
    padding: 10,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  productIcon: {
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
```

You should see a list of products. Clicking them will navigate (might show 404 for now - that's expected!).

---

## Part 5: Add Product Details Screen

### Task 5.1: Create Dynamic Route

Create folder and file: `app/product/[id].tsx`

```tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProductDetails() {
  const { id, name, price } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Product Details',
          headerBackTitle: 'Back',
          headerShown: true,
        }} 
      />
      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          <FontAwesome name="cube" size={120} color="#007AFF" />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.productName}>{name}</Text>
          <Text style={styles.price}>${price}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              This is a high-quality product that meets all your needs. 
              Made with premium materials and designed for durability.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.feature}>
              <FontAwesome name="check-circle" size={20} color="#34C759" />
              <Text style={styles.featureText}>Premium Quality</Text>
            </View>
            <View style={styles.feature}>
              <FontAwesome name="check-circle" size={20} color="#34C759" />
              <Text style={styles.featureText}>Fast Shipping</Text>
            </View>
            <View style={styles.feature}>
              <FontAwesome name="check-circle" size={20} color="#34C759" />
              <Text style={styles.featureText}>30-Day Returns</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => router.push('/cart')}
          >
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10,
  },
  footer: {
    padding: 20,
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
```
Click on a product from home screen. You should see the details page with back button working!

---

## Part 6: Add Cart Modal

### Task 6.1: Create Cart Screen

Create `app/cart.tsx` (not inside (tabs) folder):

```tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          presentation: 'modal',
          title: 'Shopping Cart',
        }} 
      />
      <View style={styles.container}>
        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add products to get started</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

Click cart icon or "Add to Cart" button. Modal should slide up from bottom!

---

## Part 7: Build Profile Screen

### Task 7.1: Create Profile Screen

Edit `app/(tabs)/profile.tsx`:

```tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const menuItems = [
    { icon: 'heart', label: 'Favorites', route: '/favorites' },
    { icon: 'receipt', label: 'Order History', route: '/orders' },
    { icon: 'settings', label: 'Settings', route: '/settings' },
    { icon: 'help-circle', label: 'Help & Support', route: '/help' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color="white" />
        </View>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john.doe@example.com</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
          >
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon} size={24} color="#007AFF" />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  menu: {
    backgroundColor: 'white',
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: 'white',
    margin: 20,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

 Navigate to Profile tab. You should see user info and menu options.

---

