import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@pure_language';

class StorageService {
  async setLanguage(language: string): Promise<void> {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  }

  async getLanguage(): Promise<string | null> {
    return AsyncStorage.getItem(LANGUAGE_KEY);
  }
}

export const storageService = new StorageService();
export default storageService;
