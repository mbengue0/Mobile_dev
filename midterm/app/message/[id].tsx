import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState, useEffect } from 'react';
import { default as emails, listEmails, toggleStar } from '@/data/mockEmails';

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const email = useMemo(() => emails.find((e) => e.id === id), [id, refreshKey]);

  useEffect(() => {
    // If email not found, go back
    if (!email) router.back();
  }, [email, router]);

  if (!email) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Back">
          <MaterialIcons name="arrow-back" size={24} color="#1976D2" />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.iconBtn} onPress={() => { toggleStar(email.id); setRefreshKey(k => k + 1); }} accessibilityLabel="Star">
          <MaterialIcons name={email.starred ? 'star' : 'star-border'} size={24} color={email.starred ? '#FBC02D' : '#777'} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.subject}>{email.subject}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.from}>{email.from.name} <Text style={styles.email}>{`<${email.from.email}>`}</Text></Text>
          <Text style={styles.time}>{email.time}</Text>
        </View>
        <Text style={styles.to}>To {email.to.email}</Text>
        <View style={{ height: 16 }} />
        <Text style={styles.body}>{email.preview}\n\n(This is mock content.)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  iconBtn: { padding: 8 },
  subject: { fontSize: 20, fontWeight: '700', color: '#111' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  from: { color: '#333' },
  email: { color: '#777' },
  time: { color: '#777' },
  to: { color: '#555', marginTop: 4 },
  body: { color: '#222', lineHeight: 20 },
});


