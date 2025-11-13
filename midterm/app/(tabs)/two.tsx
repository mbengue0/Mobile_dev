import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Pressable } from 'react-native';

const recent = Array.from({ length: 10 }).map((_, i) => ({ id: `meet_${i}`, title: `Team sync ${i + 1}` }));

export default function MeetScreen() {
  const [code, setCode] = useState('');
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Pressable style={styles.primary}>
        <Text style={styles.primaryText}>New meeting</Text>
      </Pressable>
      <View style={styles.joinRow}>
        <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="Enter a code" />
        <Pressable style={styles.joinBtn}>
          <Text style={{ color: '#1976D2', fontWeight: '600' }}>Join</Text>
        </Pressable>
      </View>
      <Text style={styles.section}>Recent</Text>
      <FlatList
        data={recent}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.item}><Text>{item.title}</Text></View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  joinRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10 },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: '#1976D2' },
  section: { marginTop: 24, marginBottom: 8, fontWeight: '700', color: '#444' },
  item: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
});
