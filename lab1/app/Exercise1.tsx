import { Text, View } from "react-native";

export function Exercise1() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "lightblue", 
      }}
    >
      <Text style={{fontSize:24, fontWeight: "bold" }}>Hello World!</Text>
    </View>
  );
}