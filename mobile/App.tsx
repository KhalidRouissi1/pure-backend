import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, DefaultTheme } from 'react-native-paper';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { fontConfig } from './src/theme/fonts';
import { AuthProvider } from './src/hooks/useAuth';
import './src/i18n/config';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN),
  sendDefaultPii: false,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
});

const theme = {
  ...DefaultTheme,
  roundness: 12,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: colors.textLight,
    onSurface: colors.text,
    onBackground: colors.text,
    disabled: colors.disabled,
    placeholder: colors.textSecondary,
    backdrop: 'rgba(28, 20, 16, 0.5)',
  },
};

SplashScreen.preventAutoHideAsync();

function App() {
  const [fontsLoaded, fontError] = useFonts(fontConfig);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Provider theme={theme}>
          <StatusBar style="dark" />
          <RootNavigator />
        </Provider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
