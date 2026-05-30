import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@watani_token';
const USER_KEY = '@watani_user';
const LANGUAGE_KEY = '@watani_language';

class StorageService {
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async getUser(): Promise<any | null> {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  }

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }

  async setLanguage(language: string): Promise<void> {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  }

  async getLanguage(): Promise<string | null> {
    return AsyncStorage.getItem(LANGUAGE_KEY);
  }
}

export const storageService = new StorageService();
export default storageService;
