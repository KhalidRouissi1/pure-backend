import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import AdaptiveSplitLayout from '../components/layout/AdaptiveSplitLayout';
import ResponsiveContent from '../components/layout/ResponsiveContent';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export default function Login({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isWide } = useResponsiveLayout();
  const { t } = useTranslation(['auth', 'common']);
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('common:error'), t('auth:enter_email_password'));
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert(t('common:error'), error?.message || t('auth:invalid_email_password'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AdaptiveSplitLayout
          primary={
            <View
              style={[styles.header, isWide && styles.headerWide, { paddingTop: insets.top + 28 }]}
            >
              <Image
                source={require('../../public/login.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.brand}>pure</Text>
              <Text style={styles.tagline}>{t('auth:brand_tagline')}</Text>
            </View>
          }
          secondary={
            <ResponsiveContent variant="form" style={styles.form}>
              <Text style={styles.title}>{t('auth:welcome_back')}</Text>
              <Text style={styles.subtitle}>{t('auth:sign_in_subtitle')}</Text>

              <Text style={styles.label}>{t('auth:email_label')}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={19} color={colors.textTertiary} />
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
              </View>

              <Text style={styles.label}>{t('auth:password_label')}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={19} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('auth:passwordPlaceholder')}
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                  editable={!submitting}
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword((value) => !value)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotLink}
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={submitting}
              >
                <Text style={styles.forgotText}>{t('auth:forgotPassword')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, submitting && styles.disabled]}
                onPress={handleLogin}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{t('auth:loginButton')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
                disabled={submitting}
              >
                <Text style={styles.registerText}>
                  {t('auth:dontHaveAccount')}{' '}
                  <Text style={styles.registerStrong}>{t('auth:register')}</Text>
                </Text>
              </TouchableOpacity>
            </ResponsiveContent>
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  header: {
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerWide: { flex: 1, margin: 24, borderRadius: 32, paddingHorizontal: 24 },
  logo: { width: 58, height: 58, tintColor: '#fff' },
  brand: { color: '#fff', fontFamily: FontFamilies.extraBold, fontSize: 31, marginTop: 4 },
  tagline: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: FontFamilies.regular,
    fontSize: 14,
    marginTop: 3,
  },
  form: { padding: 24, flex: 1 },
  title: { fontFamily: FontFamilies.extraBold, fontSize: 27, color: colors.text, marginTop: 10 },
  subtitle: {
    fontFamily: FontFamilies.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 28,
  },
  label: {
    fontFamily: FontFamilies.semiBold,
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  inputWrap: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 19,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    color: colors.text,
    fontFamily: FontFamilies.regular,
    fontSize: 15,
  },
  button: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  forgotLink: { alignSelf: 'flex-end', marginTop: -9, marginBottom: 10, paddingVertical: 4 },
  forgotText: { color: colors.primary, fontFamily: FontFamilies.semiBold, fontSize: 13 },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontFamily: FontFamilies.bold, fontSize: 16 },
  registerLink: { paddingVertical: 24, alignItems: 'center' },
  registerText: { color: colors.textSecondary, fontFamily: FontFamilies.regular, fontSize: 14 },
  registerStrong: { color: colors.primary, fontFamily: FontFamilies.bold },
});
