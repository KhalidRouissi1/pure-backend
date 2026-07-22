import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import AdaptiveSplitLayout from '../components/layout/AdaptiveSplitLayout';
import ResponsiveContent from '../components/layout/ResponsiveContent';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export default function Register({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isWide } = useResponsiveLayout();
  const { t } = useTranslation(['auth', 'common']);
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert(t('common:error'), t('common:required_fields'));
      return;
    }
    if (password.length < 8) {
      Alert.alert(t('common:error'), t('auth:password_minimum'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('common:error'), t('common:password_mismatch'));
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({ name, email, password });
      if (result.requiresVerification) {
        Alert.alert(t('common:success'), t('auth:verification_sent'), [
          { text: t('common:ok'), onPress: () => navigation.replace('Login') },
        ]);
      }
    } catch (error: any) {
      Alert.alert(t('common:error'), error?.message || t('auth:registration_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <AdaptiveSplitLayout
          primary={
            <View
              style={[styles.header, isWide && styles.headerWide, { paddingTop: insets.top + 20 }]}
            >
              <LinearGradient
                colors={[colors.primaryDark, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.patternCircle1} />
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={colors.textLight} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('auth:create_account')}</Text>
              <Text style={styles.headerSub}>{t('auth:join_marketplace')}</Text>
            </View>
          }
          secondary={
            <ResponsiveContent variant="form" style={styles.formPane}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('auth:name_label')}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={18} color={colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth:name_placeholder')}
                      value={name}
                      onChangeText={setName}
                      autoComplete="name"
                      editable={!submitting}
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('auth:email_label')}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={18} color={colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth:emailPlaceholder')}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('auth:password_label')}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth:passwordPlaceholder')}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholderTextColor={colors.textTertiary}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('auth:confirm_password_label')}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={18}
                      color={colors.textTertiary}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth:confirmPasswordPlaceholder')}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, submitting && { opacity: 0.6 }]}
                  onPress={handleRegister}
                  disabled={submitting}
                >
                  <LinearGradient
                    colors={[colors.secondary, colors.secondaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>{t('auth:create_button')}</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.termsRow}>
                  <Text style={styles.termsText}>
                    {t('auth:terms_text')}{' '}
                    <Text
                      style={styles.termsLink}
                      onPress={() => navigation.navigate('LegalDocument', { document: 'terms' })}
                    >
                      {t('auth:terms_link')}
                    </Text>{' '}
                    {t('auth:and')}{' '}
                    <Text
                      style={styles.termsLink}
                      onPress={() => navigation.navigate('LegalDocument', { document: 'privacy' })}
                    >
                      {t('auth:privacyPolicy')}
                    </Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginLinkText}>
                  {t('auth:have_account')}{' '}
                  <Text style={styles.loginLinkBold}>{t('auth:sign_in')}</Text>
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
  scrollContent: { flexGrow: 1 },
  header: {
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  headerWide: { flex: 1, margin: 24, borderRadius: 32, justifyContent: 'center' },
  patternCircle1: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontFamily: FontFamilies.extraBold, fontSize: 28, color: '#FFFFFF' },
  headerSub: {
    fontFamily: FontFamilies.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
  },
  form: { paddingHorizontal: 24, paddingTop: 28 },
  formPane: { justifyContent: 'center' },
  roleCards: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  roleCardActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  roleCardText: { fontFamily: FontFamilies.semiBold, fontSize: 15, color: colors.textTertiary },
  roleCardTextActive: { color: colors.primary },
  inputGroup: { marginBottom: 18 },
  inputLabel: {
    fontFamily: FontFamilies.semiBold,
    fontSize: 10,
    color: colors.textTertiary,
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontFamily: FontFamilies.regular,
    color: colors.text,
    padding: 0,
  },
  primaryButton: { borderRadius: 14, height: 52, overflow: 'hidden', marginTop: 8 },
  buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 14 },
  primaryButtonText: {
    fontFamily: FontFamilies.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  termsRow: { marginTop: 16, paddingHorizontal: 8 },
  termsText: {
    fontFamily: FontFamilies.regular,
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: { color: colors.primary, fontFamily: FontFamilies.semiBold },
  loginLink: { alignItems: 'center', paddingVertical: 24 },
  loginLinkText: { fontFamily: FontFamilies.regular, fontSize: 14, color: colors.textSecondary },
  loginLinkBold: { color: colors.secondary, fontFamily: FontFamilies.bold },
});
