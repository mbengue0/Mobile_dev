import { ScrollView, Text } from "react-native";

export  function Exercise4() {
  const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];

  return (
    <ScrollView style={{ margin: 10 }}>
      {fruits.map((fruit, index) => (
        <Text
          key={index}
          style={{
            padding: 15,
            borderBottomWidth: 1,
            fontSize: 16,
            backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#e0e0e0'
          }}
        >
          {fruit}
        </Text>
      ))}
      {fruits.length > 5 && (
        <Text style={{ padding: 15, fontSize: 16, textAlign: "center" }}>
          End of List
        </Text>
      )}
    </ScrollView>
  );
}