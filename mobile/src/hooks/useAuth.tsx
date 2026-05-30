import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { User, Role } from '../types';
import storageService from '../services/storage';
import apiService from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  role: Role;
  city?: string;
  phone?: string;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await storageService.getUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response: any = await apiService.post('auth/login', { email, password });
    const payload = response?.data || response;
    const { user: userData, accessToken } = payload;

    if (!accessToken || !userData) {
      throw new Error('Invalid response from server');
    }

    await storageService.setToken(accessToken);
    await storageService.setUser(userData);
    setUser(userData);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response: any = await apiService.post('auth/register', data);
    const payload = response?.data || response;
    const { user: userData, accessToken } = payload;

    await storageService.setToken(accessToken);
    await storageService.setUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await storageService.clear();
    setUser(null);
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    storageService.setUser(userData);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
