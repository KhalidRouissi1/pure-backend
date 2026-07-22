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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackHeader from '../components/BackHeader';
import ResponsiveContent from '../components/layout/ResponsiveContent';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';

export default function ForgotPassword({ navigation }: { navigation: { goBack: () => void } }) {
  const { t } = useTranslation(['auth', 'common']);
  const { requestPasswordReset } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      Alert.alert(t('auth:reset_email_title'), t('auth:reset_email_sent'), [
        { text: t('common:ok'), onPress: navigation.goBack },
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
    <View style={[styles.root, { paddingBottom: insets.bottom + 24 }]}>
      <BackHeader title={t('auth:forgotPassword')} />
      <ResponsiveContent variant="form" style={styles.content}>
        <Text style={styles.description}>{t('auth:reset_description')}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth:emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!submitting}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={submit}
          disabled={submitting || !email.trim()}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('auth:send_reset_link')}</Text>
          )}
        </TouchableOpacity>
      </ResponsiveContent>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 24 },
  description: {
    color: colors.textSecondary,
    fontFamily: FontFamilies.regular,
    marginBottom: 20,
    lineHeight: 21,
  },
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
    marginTop: 18,
  },
  buttonText: { color: '#fff', fontFamily: FontFamilies.bold, fontSize: 16 },
});
