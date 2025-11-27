import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Menu() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lab 11: Notifications</Text>
      
      <Link href="/exercise1" style={styles.link}>
        <Text style={styles.linkText}>Exercise 1: Local Reminder</Text>
      </Link>

      <Link href="/exercise2" style={styles.link}>
        <Text style={styles.linkText}>Exercise 2: Push Promo</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  link: { padding: 15, backgroundColor: '#3498db', borderRadius: 8 },
  linkText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});