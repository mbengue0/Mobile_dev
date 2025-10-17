import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NoteService } from '../services/dbService';

const NoteList = ({ onNotePress }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const notesData = await NoteService.getNotes();
    setNotes(notesData);
  };

  const renderNote = ({ item }) => (
    <TouchableOpacity style={styles.noteCard} onPress={() => onNotePress(item)}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.noteFooter}>
        <Text style={[styles.category, { backgroundColor: item.category_color }]}>
          {item.category_name}
        </Text>
        <Text style={styles.date}>
          {new Date(item.updated_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Notes ({notes.length})</Text>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNote}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default NoteList;