import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import BackHeader from '../components/BackHeader';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Settings() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation(['common', 'settings']);
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(t('settings:logout.title'), t('settings:logout.message'), [
      {
        text: t('common:cancel'),
        style: 'cancel',
      },
      {
        text: t('common:confirm'),
        onPress: logout,
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <BackHeader title={t('settings:title')} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings:language.title')}</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="globe-outline" size={20} color={colors.secondary} />
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>{t('settings:language.current')}</Text>
                <Text style={styles.settingValue}>
                  {i18n.language === 'ar' ? 'العربية' : 'English'}
                </Text>
              </View>
            </View>
            <LanguageSwitcher />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings:preferences.title')}</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={20} color={colors.secondary} />
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>{t('settings:preferences.notifications')}</Text>
                <Text style={styles.settingDesc}>{t('settings:preferences.notificationsDesc')}</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.secondaryLight }}
              thumbColor={notificationsEnabled ? colors.secondary : colors.surface}
            />
          </View>
          <View style={styles.settingDivider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={20} color={colors.secondary} />
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>{t('settings:preferences.darkMode')}</Text>
                <Text style={styles.settingDesc}>{t('settings:preferences.darkModeDesc')}</Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: colors.border, true: colors.secondaryLight }}
              thumbColor={darkModeEnabled ? colors.secondary : colors.surface}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings:account.title')}</Text>
          {user && (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="mail-outline" size={20} color={colors.textTertiary} />
                  <Text style={styles.settingLabel}>{user.email}</Text>
                </View>
              </View>
              {user.city && (
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="location-outline" size={20} color={colors.textTertiary} />
                    <Text style={styles.settingLabel}>{user.city}</Text>
                  </View>
                </View>
              )}
              {user.phone && (
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Ionicons name="call-outline" size={20} color={colors.textTertiary} />
                    <Text style={styles.settingLabel}>{user.phone}</Text>
                  </View>
                </View>
              )}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="shield-outline" size={20} color={colors.textTertiary} />
                  <Text style={styles.settingLabel}>{user.role}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('settings:support.title')}</Text>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle-outline" size={20} color={colors.secondary} />
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>{t('settings:support.help')}</Text>
                <Text style={styles.settingDesc}>{t('settings:support.helpDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={styles.settingDivider} />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="mail-outline" size={20} color={colors.secondary} />
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>{t('settings:support.contact')}</Text>
                <Text style={styles.settingDesc}>{t('settings:support.contactDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={styles.settingDivider} />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={20} color={colors.secondary} />
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>{t('settings:support.about')}</Text>
                <Text style={styles.settingDesc}>{t('settings:support.aboutDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutButtonText}>{t('settings:logout.button')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>{t('common:version', { ns: 'common' })}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTitle: {
    fontFamily: FontFamilies.bodySemiBold,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingLabel: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  settingDesc: {
    fontFamily: FontFamilies.body,
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  settingValue: {
    fontFamily: FontFamilies.bodySemiBold,
    fontSize: 14,
    color: colors.text,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.errorLight,
    marginTop: 8,
  },
  logoutButtonText: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 15,
    color: colors.error,
  },
  versionText: {
    fontFamily: FontFamilies.body,
    fontSize: 12,
    textAlign: 'center',
    color: colors.textTertiary,
    marginTop: 20,
    marginBottom: 16,
  },
});
