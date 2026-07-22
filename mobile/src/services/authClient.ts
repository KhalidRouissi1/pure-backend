import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/apiBaseUrl';

export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/auth`,
  plugins: [
    expoClient({
      scheme: 'pure',
      storagePrefix: 'pure',
      cookiePrefix: 'pure',
      storage: SecureStore,
    }),
  ],
});

export default authClient;
