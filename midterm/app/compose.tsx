import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { sendMockEmail } from '@/data/mockEmails';

export default function ComposeScreen() {
  const router = useRouter();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const onSend = () => {
    if (!to || !subject) return;
    sendMockEmail({ to, subject, body });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.row}>
        <Text style={styles.label}>To</Text>
        <TextInput style={styles.input} value={to} onChangeText={setTo} placeholder="recipient" />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Subject</Text>
        <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="Subject" />
      </View>
      <TextInput
        style={styles.body}
        value={body}
        onChangeText={setBody}
        placeholder="Compose email"
        multiline
        textAlignVertical="top"
      />
      <View style={styles.toolbar}>
        <Pressable onPress={onSend} style={styles.iconBtn} accessibilityLabel="Send">
          <MaterialIcons name="send" size={22} color="#1976D2" />
        </Pressable>
        <Pressable style={styles.iconBtn} accessibilityLabel="Attach">
          <MaterialIcons name="attach-file" size={22} color="#555" />
        </Pressable>
        <Pressable style={styles.iconBtn} accessibilityLabel="More">
          <MaterialIcons name="more-vert" size={22} color="#555" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  label: { width: 70, color: '#666' },
  input: { flex: 1, paddingVertical: 6, color: '#111' },
  body: { flex: 1, padding: 12, color: '#111' },
  toolbar: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  iconBtn: { padding: 8 },
});


