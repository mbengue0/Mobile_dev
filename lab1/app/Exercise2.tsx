import { Image, StyleSheet, Text, View } from "react-native";

export function Exercise2() {
  return (
    <View style={styles.profileCard}>
      <Image
        source={{ uri: "https://placehold.co/100x100" }}
        style={styles.profileImage}
      />
      <Text style={styles.nameText}>John Doe</Text>
      <Text style={styles.bioText}>Software Developer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bioText: {
    fontSize: 16,
    color: '#666',
  },
});