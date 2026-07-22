import Constants from 'expo-constants';
import { Platform } from 'react-native';

function developmentHost(): string {
  const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
  const isLoopback = metroHost === 'localhost' || metroHost === '127.0.0.1';
  if (metroHost && !(Platform.OS === 'android' && isLoopback)) return metroHost;

  // Android emulators cannot reach the host machine through localhost.
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL = (
  configuredUrl || `http://${developmentHost()}:3000/api`
).replace(/\/$/, '');
