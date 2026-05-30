import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  I18nManager,
  Alert
} from 'react-native';
import {
  Menu,
  IconButton,
  Text,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../i18n/config';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const [visible, setVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  ];

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const handleChangeLanguage = async (langCode: string) => {
    try {
      await setLanguage(langCode);
      setCurrentLang(langCode);
      setVisible(false);
      
      // Force reload to apply RTL changes properly
      setTimeout(() => {
        Alert.alert(
          langCode === 'ar' ? 'تم تغيير اللغة' : 'Language Changed',
          langCode === 'ar' 
            ? 'لتطبيق تغييرات الاتجاه (RTL) بشكل صحيح، يرجى إغلاق التطبيق وإعادة فتحه.'
            : 'To apply Right-to-Left (RTL) changes correctly, please close the app and reopen it.',
          [{ text: 'OK' }]
        );
      }, 300);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getCurrentLanguageInfo = () => {
    return languages.find(lang => lang.code === currentLang) || languages[0];
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <View style={styles.menuAnchor}>
            <IconButton
              icon="translate"
              size={24}
              onPress={() => setVisible(true)}
            />
            <Text style={styles.currentLangText}>
              {getCurrentLanguageInfo().nativeName}
            </Text>
          </View>
        }
      >
        {languages.map(language => (
          <Menu.Item
            key={language.code}
            onPress={() => handleChangeLanguage(language.code)}
            title={language.nativeName}
            leadingIcon={language.code === currentLang ? 'check' : undefined}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  menuAnchor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLangText: {
    marginLeft: 4,
    fontSize: 14,
  },
});
