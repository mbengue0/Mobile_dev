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