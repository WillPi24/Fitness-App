import * as SecureStore from 'expo-secure-store';

// Storage adapter backed by the device keychain / keystore (via
// expo-secure-store). Used as the storage layer for the Supabase auth client
// so that JWT access + refresh tokens are not persisted in plaintext
// AsyncStorage. SecureStore values are capped at ~2 KB which is more than
// enough for the combined Supabase JWTs.
export const SecureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  },
};
