import { Image, StyleSheet, Text, View } from "react-native";

export default function Exercise2() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://placehold.co/100x100" }}
        style={styles.image}
      />
      <Text style={styles.name}>John Doe</Text>
      <Text style={styles.bio}>Software Developer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 10,
    margin: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50, 
  },
  name: {
    fontSize: 24,
    color: "#333",
    fontWeight: "bold"
  },
  bio: {
    fontSize: 16,
    color: "#666",
  },
});
