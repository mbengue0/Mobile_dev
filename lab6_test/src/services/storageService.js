import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEYS = {
  THEME: '@notes:theme',
  SORT_BY: '@notes:sortBy',
  LANGUAGE: '@notes:language'
};

export const StorageService = {
  // Save app settings
  async saveSetting(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving setting:', error);
      return false;
    }
  },

  // Load app settings with default value
  async getSetting(key, defaultValue = null) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('Error loading setting:', error);
      return defaultValue;
    }
  },

  // Get all settings
  async getAllSettings() {
    try {
      const [theme, sortBy, language] = await Promise.all([
        this.getSetting(SETTINGS_KEYS.THEME, 'light'),
        this.getSetting(SETTINGS_KEYS.SORT_BY, 'date'),
        this.getSetting(SETTINGS_KEYS.LANGUAGE, 'en')
      ]);
      
      return { theme, sortBy, language };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { theme: 'light', sortBy: 'date', language: 'en' };
    }
  },

  // Clear all settings
  async clearSettings() {
    try {
      await AsyncStorage.multiRemove(Object.values(SETTINGS_KEYS));
      return true;
    } catch (error) {
      console.error('Error clearing settings:', error);
      return false;
    }
  }
};

export { SETTINGS_KEYS };