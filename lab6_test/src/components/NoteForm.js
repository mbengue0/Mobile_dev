import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NoteService } from '../services/dbService';

const NoteForm = ({ onSave, initialNote = null }) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      if (initialNote) {
        await NoteService.updateNote(initialNote.id, title, content, initialNote.category_id);
      } else {
        await NoteService.addNote(title, content);
      }
      onSave();
    } catch (error) {
      alert('Error saving note');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {initialNote ? 'Edit Note' : 'New Note'}
      </Text>
      
      <TextInput
        style={styles.titleInput}
        placeholder="Note Title"
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={styles.contentInput}
        placeholder="Note Content"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {initialNote ? 'Update Note' : 'Save Note'}
        </Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 120,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NoteForm;