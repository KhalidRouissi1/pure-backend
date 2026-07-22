import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { AppState } from 'react-native';
import { User } from '../types';
import authClient from '../services/authClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ requiresVerification: boolean }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  deleteAccount: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  city?: string;
  phone?: string;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => ({ requiresVerification: false }),
  logout: async () => {},
  updateUser: () => {},
  deleteAccount: async () => {},
  requestPasswordReset: async () => {},
  resetPassword: async () => {},
  refreshUser: async () => {},
});

function toAppUser(authUser: unknown): User | null {
  if (!authUser) return null;
  const user = authUser as Record<string, any>;
  return {
    ...user,
    role: user.role || 'USER',
    avatarUrl: user.avatarUrl ?? user.image ?? undefined,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
  } as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data, error } = await authClient.getSession({ query: { disableCookieCache: true } });
    if (error) throw new Error(error.message || 'Unable to refresh session');
    setUser(toAppUser(data?.user));
  }, []);

  useEffect(() => {
    refreshUser()
      .catch((error) => console.error('Error loading user:', error))
      .finally(() => setIsLoading(false));

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshUser().catch(() => undefined);
    });
    return () => subscription.remove();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(error.message || 'Invalid email or password');
    setUser(toAppUser(data?.user));
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const result = await authClient.signUp.email({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      city: data.city?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      callbackURL: 'pure://',
    } as any);
    if (result.error) throw new Error(result.error.message || 'Unable to create account');
    const requiresVerification = !result.data?.token;
    setUser(requiresVerification ? null : toAppUser(result.data?.user));
    return { requiresVerification };
  }, []);

  const logout = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const deleteAccount = useCallback(async () => {
    const { error } = await authClient.deleteUser();
    if (error) throw new Error(error.message || 'Unable to delete account');
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await authClient.requestPasswordReset({
      email: email.trim().toLowerCase(),
      redirectTo: 'pure://reset-password',
    });
    if (error) throw new Error(error.message || 'Unable to send password reset email');
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    const { error } = await authClient.resetPassword({ token, newPassword });
    if (error) throw new Error(error.message || 'Unable to reset password');
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
        deleteAccount,
        requestPasswordReset,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
