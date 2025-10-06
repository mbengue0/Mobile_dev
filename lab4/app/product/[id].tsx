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