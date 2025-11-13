import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import Avatar from './Avatar';

function EmailItem({ item, onPress, onToggleStar, onArchive, onDelete }) {
  const renderLeft = () => (
    <View style={[styles.action, { backgroundColor: '#66BB6A' }]}>
      <MaterialIcons name="archive" size={22} color="#fff" />
      <Text style={styles.actionText}>Archive</Text>
    </View>
  );
  const renderRight = () => (
    <View style={[styles.action, { backgroundColor: '#E53935' }]}>
      <MaterialIcons name="delete" size={22} color="#fff" />
      <Text style={styles.actionText}>Delete</Text>
    </View>
  );

  return (
    <Swipeable
      renderLeftActions={renderLeft}
      renderRightActions={renderRight}
      onSwipeableLeftOpen={() => onArchive?.(item.id)}
      onSwipeableRightOpen={() => onDelete?.(item.id)}
    >
      <Pressable style={styles.container} onPress={() => onPress?.(item)}>
      <Avatar name={item.from.name} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.sender, !item.read && styles.unread]} numberOfLines={1}>
            {item.from.name}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.subject, !item.read && styles.unread]} numberOfLines={1}>
            {item.subject}
          </Text>
          {item.important && <MaterialIcons name="label-important" size={18} color="#D93025" />}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {item.preview}
        </Text>
      </View>
        <TouchableOpacity hitSlop={8} onPress={() => onToggleStar?.(item.id)}>
          <MaterialIcons name={item.starred ? 'star' : 'star-border'} size={22} color={item.starred ? '#FBC02D' : '#777'} />
        </TouchableOpacity>
      </Pressable>
    </Swipeable>
  );
}

export default memo(EmailItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: '#fff',
  },
  content: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sender: { fontSize: 14, color: '#111' },
  subject: { fontSize: 13, color: '#333' },
  preview: { fontSize: 12, color: '#666', marginTop: 2 },
  time: { fontSize: 12, color: '#777', marginLeft: 8 },
  unread: { fontWeight: '700' },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  actionText: { color: '#fff', fontWeight: '700' },
});


