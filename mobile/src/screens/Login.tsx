import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { useAuth } from '../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Instacart-like colors
const INSTA_GREEN = '#0AAD0A';
const INSTA_DARK_GREEN = '#003D29';
const INSTA_LIGHT_GRAY = '#F2F3F7';

export default function Login({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 360;
  const { t, i18n } = useTranslation(['auth', 'common']);
  const isRTL = i18n.language === 'ar' || i18n.language === 'tn';

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingRole, setSubmittingRole] = useState<'admin' | 'seller' | 'client' | null>(null);
  const { login } = useAuth();

  const demoAccounts = {
    admin: { label: t('auth:continue_admin'), email: 'admin@watani.local', password: 'Admin123!', icon: 'shield-checkmark-outline' },
    seller: { label: t('auth:continue_seller'), email: 'seller@watani.local', password: 'Seller123!', icon: 'storefront-outline' },
    client: { label: t('auth:continue_client'), email: 'user@watani.local', password: 'User123!', icon: 'person-outline' },
  } as const;

  const roleButtonStyles = {
    admin: styles.adminButton,
    seller: styles.sellerButton,
    client: styles.clientButton,
  } as const;

  const handleDemoLogin = async (role: keyof typeof demoAccounts) => {
    setError('');
    setIsSubmitting(true);
    setSubmittingRole(role);
    try {
      const account = demoAccounts[role];
      await login(account.email, account.password);
      navigation.navigate('MainTabs');
    } catch (err: any) {
      setError(err?.message || err?.toString() || t('auth:invalid_email_password'));
    } finally {
      setIsSubmitting(false);
      setSubmittingRole(null);
    }
  };

  const getArabicFont = (weight: 'regular' | 'bold' | 'light' = 'regular') => {
    if (isRTL) {
      switch (weight) {
        case 'bold': return FontFamilies.arabicBold;
        case 'light': return FontFamilies.arabicLight;
        default: return FontFamilies.arabicRegular;
      }
    }
    return FontFamilies.regular;
  };

  return (
    <View style={styles.root}>
      {/* Deep Green Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, paddingBottom: isCompactWidth ? 14 : 20 }]}> 
        <View style={styles.logoRow}>
          <Image 
            source={require('../../public/login.png')} 
            style={[styles.logoIcon, isCompactWidth && styles.logoIconCompact]}
            resizeMode="contain"
          />
          <Text style={[styles.logoText, isCompactWidth && styles.logoTextCompact, { fontFamily: getArabicFont('bold') }]}>watani</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.demoLoginContainer}>
            <Text style={[styles.demoTitle, { fontFamily: getArabicFont('bold') }]}> 
              {t('auth:choose_demo_role')}
            </Text>
            {(Object.keys(demoAccounts) as Array<keyof typeof demoAccounts>).map((role) => {
              const account = demoAccounts[role];
              const isLoadingRole = isSubmitting && submittingRole === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[styles.demoButton, roleButtonStyles[role], isSubmitting && styles.buttonDisabled]}
                  onPress={() => handleDemoLogin(role)}
                  disabled={isSubmitting}
                >
                  {isLoadingRole ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name={account.icon as any} size={22} color="#FFFFFF" />
                      <Text style={[styles.demoButtonText, { fontFamily: getArabicFont('bold') }]}> 
                        {account.label}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.footerText, { fontFamily: getArabicFont() }]}>
              {t('auth:curated_by')} <Text style={styles.footerBrand}>NVS</Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: INSTA_DARK_GREEN,
    paddingBottom: 20,
    alignItems: 'center',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 2,
    marginBottom: 15,
  },
  segmentButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 18,
  },
  segmentButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  segmentText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
    tintColor: '#FFFFFF', // Assuming login.png can be tinted if it's a logo, otherwise we'll just show it
  },
  logoIconCompact: {
    width: 26,
    height: 26,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    letterSpacing: 0,
  },
  logoTextCompact: {
    fontSize: 24,
  },
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  promoCardCompact: {
    marginBottom: 18,
  },
  promoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 30,
  },
  promoHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFEB3B',
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    gap: 5,
  },
  promoEmoji: { fontSize: 18 },
  promoTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  promoDiscount: { fontSize: 16, fontWeight: '700' },
  promoImage: {
    width: '100%',
  },
  promoContent: {
    padding: 20,
    alignItems: 'center',
  },
  promoMainText: {
    fontSize: 22,
    textAlign: 'center',
    color: '#333333',
    lineHeight: 28,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  signUpButton: {
    backgroundColor: INSTA_GREEN,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  loginButton: {
    backgroundColor: INSTA_LIGHT_GRAY,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loginButtonText: {
    color: '#333333',
    fontSize: 18,
  },
  guestButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  guestButtonText: {
    color: INSTA_GREEN,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  formContainer: {
    width: '100%',
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INSTA_LIGHT_GRAY,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loginButtonActive: {
    backgroundColor: INSTA_GREEN,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonTextActive: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  demoLoginContainer: {
    width: '100%',
    marginTop: 36,
    gap: 14,
  },
  demoTitle: {
    color: '#1C1410',
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    marginBottom: 8,
  },
  demoButton: {
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  adminButton: {
    backgroundColor: '#8B2252',
  },
  sellerButton: {
    backgroundColor: '#1B4D3E',
  },
  clientButton: {
    backgroundColor: '#B8860B',
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#999999',
    fontSize: 14,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 20,
  },
  footerText: {
    color: '#999999',
    fontSize: 12,
  },
  footerBrand: {
    fontWeight: 'bold',
    color: '#666666',
  },
});
