import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import NoteList from '../components/NoteList';
import NoteForm from '../components/NoteForm';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';

const HomeScreen = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
  const [selectedNote, setSelectedNote] = useState(null);
  const [theme, setTheme] = useState('light');
  const [settings, setSettings] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await StorageService.getAllSettings();
    setSettings(savedSettings);
    setTheme(savedSettings.theme);
  };

  const handleAddNote = () => {
    setSelectedNote(null);
    setCurrentView('form');
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setCurrentView('form');
  };

  const handleSaveNote = () => {
    setCurrentView('list');
  };

  const handleLogout = async () => {
    await AuthService.clearAll();
    onLogout();
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await StorageService.saveSetting('@notes:theme', newTheme);
  };

  const containerStyle = theme === 'dark' ? styles.darkContainer : styles.lightContainer;
  const textStyle = theme === 'dark' ? styles.darkText : styles.lightText;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>My Notes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
            <Text style={styles.themeButtonText}>
              {theme === 'light' ? '🌙' : '☀️'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {currentView === 'list' ? (
        <>
          <NoteList onNotePress={handleEditNote} />
          <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
            <Text style={styles.addButtonText}>+ New Note</Text>
          </TouchableOpacity>
        </>
      ) : (
        <NoteForm 
          onSave={handleSaveNote}
          initialNote={selectedNote}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  lightText: {
    color: '#333',
  },
  darkText: {
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeButton: {
    padding: 8,
    marginRight: 12,
  },
  themeButtonText: {
    fontSize: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;