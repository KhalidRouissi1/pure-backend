import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import BackHeader from '../components/BackHeader';
import ResponsiveContent from '../components/layout/ResponsiveContent';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';

interface ResetPasswordProps {
  route: { params?: { token?: string; error?: string } };
  navigation: { navigate: (screen: string) => void };
}

export default function ResetPassword({ route, navigation }: ResetPasswordProps) {
  const { t } = useTranslation(['auth', 'common']);
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const token = route.params?.token;

  const submit = async () => {
    if (!token || password.length < 8 || password !== confirmation) {
      Alert.alert(t('common:error'), t('auth:reset_validation'));
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      Alert.alert(t('auth:password_reset_title'), t('auth:password_reset_success'), [
        { text: t('common:ok'), onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert(
        t('common:error'),
        error instanceof Error ? error.message : t('auth:reset_failed')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <BackHeader title={t('auth:password_reset_title')} />
      <ResponsiveContent variant="form" style={styles.content}>
        {!token || route.params?.error ? (
          <Text style={styles.error}>{t('auth:reset_link_invalid')}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth:passwordPlaceholder')}
          secureTextEntry
          editable={!submitting}
        />
        <TextInput
          style={styles.input}
          value={confirmation}
          onChangeText={setConfirmation}
          placeholder={t('auth:confirmPasswordPlaceholder')}
          secureTextEntry
          editable={!submitting}
        />
        <TouchableOpacity style={styles.button} onPress={submit} disabled={submitting || !token}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('auth:reset_password_button')}</Text>
          )}
        </TouchableOpacity>
      </ResponsiveContent>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 24, gap: 14 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    color: colors.text,
    fontFamily: FontFamilies.regular,
  },
  button: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontFamily: FontFamilies.bold, fontSize: 16 },
  error: { color: colors.error, fontFamily: FontFamilies.regular },
});
