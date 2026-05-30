import React from 'react';
import { render } from '@testing-library/react-native';
import AppNavigator from '../../../src/navigation/AppNavigator';

jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: 'user-1', role: 'USER' },
  }),
}));

jest.mock('../../../src/i18n/config', () => ({
  setLanguage: jest.fn(),
  supportedLanguages: [],
  getCurrentLanguage: () => 'en',
  isRTL: () => false,
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    NavigationContainer: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
      Screen: ({ name }: { name: string }) => <Text>{name}</Text>,
    }),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
      Screen: ({ name }: { name: string }) => <Text>{name}</Text>,
    }),
  };
});

describe('AppNavigator', () => {
  it('registers ProductList for authenticated buyers', () => {
    const { getByText } = render(<AppNavigator />);

    expect(getByText('ProductList')).toBeTruthy();
  });
});
