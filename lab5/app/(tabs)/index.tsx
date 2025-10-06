import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { useCart } from '@/contexts/CartContext';

const PRODUCTS = [
  {
    id: '1',
    name: 'Apple',
    price: 1.99,
    image: '🍎',
  },
  {
    id: '2',
    name: 'Banana',
    price: 0.99,
    image: '🍌',
  },
  {
    id: '3',
    name: 'Orange',
    price: 2.49,
    image: '🍊',
  },
  {
    id: '4',
    name: 'Pizza',
    price: 12.99,
    image: '🍕',
  },
  {
    id: '5',
    name: 'Burger',
    price: 8.99,
    image: '🍔',
  },
  {
    id: '6',
    name: 'Ice Cream',
    price: 4.99,
    image: '🍦',
  },
];

export default function ProductsScreen() {
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    Alert.alert('Added to Cart', `${product.name} was added to your cart!`);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Text style={styles.productImage}>{item.image}</Text>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}>
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Products</Text>
      <FlatList
        data={PRODUCTS}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 180,
  },
  productImage: {
    fontSize: 48,
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 'auto',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});