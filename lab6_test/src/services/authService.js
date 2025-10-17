import * as SecureStore from 'expo-secure-store';

// Define keys for secure storage
const AUTH_KEYS = {
  API_TOKEN: 'notes_api_token',
  APP_PIN: 'notes_app_pin'
};

export const AuthService = {
  // Save sensitive data securely
  async saveCredential(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
      console.log(`✅ Secure data saved: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Error saving secure data for ${key}:`, error);
      return false;
    }
  },

  // Retrieve sensitive data
  async getCredential(key) {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error(`❌ Error reading secure data for ${key}:`, error);
      return null;
    }
  },

  // Delete sensitive data
  async clearCredential(key) {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log(`✅ Secure data deleted: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting secure data for ${key}:`, error);
      return false;
    }
  },

  // Clear all authentication data
  async clearAll() {
    try {
      for (const key of Object.values(AUTH_KEYS)) {
        await this.clearCredential(key);
      }
      console.log('✅ All secure data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing all auth data:', error);
      return false;
    }
  },

  // Check if user has an API token
  async isAuthenticated() {
    const token = await this.getCredential(AUTH_KEYS.API_TOKEN);
    return !!token; // Returns true if token exists, false if null/undefined
  },

  // Check if app has PIN protection
  async hasPin() {
    const pin = await this.getCredential(AUTH_KEYS.APP_PIN);
    return !!pin;
  },

  // Verify if entered PIN matches stored PIN
  async verifyPin(inputPin) {
    const storedPin = await this.getCredential(AUTH_KEYS.APP_PIN);
    return storedPin === inputPin;
  }
};

// Export keys for use in other files
export { AUTH_KEYS };