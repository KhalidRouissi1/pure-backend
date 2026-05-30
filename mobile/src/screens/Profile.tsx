import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import ProfileHeader from '../components/ProfileHeader';
import InfoRow from '../components/InfoRow';
import EditInfoModal from '../components/EditInfoModal';
import AvatarPicker from '../components/AvatarPicker';
import apiService from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Profile({ navigation }: any) {
  const { user, logout, updateUser } = useAuth();
  const { t } = useTranslation(['profile', 'common']);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editField, setEditField] = useState<{ key: string; label: string; value: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const handleEdit = useCallback((key: string, label: string, value?: string | null) => {
    setEditField({ key, label, value: value || '' });
  }, []);

  const handleSave = useCallback(
    async (newValue: string) => {
      if (!editField || !user) return;
      setSaving(true);
      try {
        const response: any = await apiService.patch('/auth/profile', {
          [editField.key]: newValue,
        });
        const updatedUser = response?.data || response;
        updateUser({ ...user, ...updatedUser });
        setEditField(null);
      } catch (err: any) {
        setError(t('errors.saveFailed'));
      } finally {
        setSaving(false);
      }
    },
    [editField, user, updateUser, t]
  );

  const handleAvatarChange = useCallback(
    async (url: string) => {
      if (!user) return;
      try {
        const response: any = await apiService.patch('/auth/profile', { avatarUrl: url });
        const updatedUser = response?.data || response;
        updateUser({ ...user, ...updatedUser });
      } catch {
        setError(t('errors.uploadFailed'));
      }
    },
    [user, updateUser, t]
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-circle-outline" size={64} color={colors.textTertiary} />
        <Text style={styles.title}>{t('title')}</Text>
        <Text style={styles.guestText}>{t('guestMessage')}</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>{t('common:login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('title')}</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <AvatarPicker
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
          role={user.role}
          onAvatarChange={handleAvatarChange}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('title')}</Text>

          <InfoRow
            label={t('fields.name')}
            value={user.name}
            onPress={() => handleEdit('name', t('fields.name'), user.name)}
          />
          <InfoRow label={t('fields.email')} value={user.email} locked />
          <InfoRow
            label={t('fields.phone')}
            value={user.phone}
            onPress={() => handleEdit('phone', t('fields.phone'), user.phone)}
          />
          <InfoRow
            label={t('fields.city')}
            value={user.city}
            onPress={() => handleEdit('city', t('fields.city'), user.city)}
          />
          <InfoRow label={t('fields.role')} value={t(`roleBadge.${user.role}`)} locked />
        </View>

        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('AddressBook')}>
          <Ionicons name="location-outline" size={20} color={colors.secondary} />
          <Text style={styles.linkText}>{t('savedAddresses')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Orders')}>
          <Ionicons name="receipt-outline" size={20} color={colors.secondary} />
          <Text style={styles.linkText}>{t('orderHistory')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color={colors.textLight} />
          <Text style={styles.logoutText}>{t('logout.title')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <EditInfoModal
        visible={!!editField}
        label={editField?.label || ''}
        value={editField?.value || ''}
        saving={saving}
        onSave={handleSave}
        onCancel={() => setEditField(null)}
        fieldKey={editField?.key}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 8,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: {
    fontFamily: FontFamilies.display,
    fontSize: 28,
    color: colors.text,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    fontFamily: FontFamilies.bodySemiBold,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 1.5,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 4,
  },
  errorText: {
    fontFamily: FontFamilies.body,
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 15,
    color: colors.textLight,
  },
  guestText: {
    fontFamily: FontFamilies.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  loginButton: {
    backgroundColor: '#0AAD0A',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  loginText: {
    fontFamily: FontFamilies.bodyBold,
    color: colors.textLight,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  linkText: {
    flex: 1,
    fontFamily: FontFamilies.bodySemiBold,
    color: colors.text,
  },
});
