import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en/common.json';
import enSettings from './en/settings.json';
import enProfile from './en/profile.json';
import enAuth from './en/auth.json';
import enDiscovery from './en/discovery.json';
import enProducts from './en/products.json';
import enAdmin from './en/admin.json';
import enStores from './en/stores.json';
import ar from './ar/common.json';
import arSettings from './ar/settings.json';
import arProfile from './ar/profile.json';
import arAuth from './ar/auth.json';
import arDiscovery from './ar/discovery.json';
import arProducts from './ar/products.json';
import arAdmin from './ar/admin.json';
import arStores from './ar/stores.json';

const LANGUAGE_KEY = '@pure_language';

export const supportedLanguages = [
  { code: 'ar', name: 'العربية', rtl: true },
  { code: 'en', name: 'English', rtl: false },
];

export const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  const language = savedLanguage || 'ar';

  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    lng: language,
    fallbackLng: 'ar',
    defaultNS: 'common',
    ns: ['common', 'auth', 'discovery', 'products', 'profile', 'settings', 'admin', 'stores'],
    resources: {
      en: {
        common: en,
        settings: enSettings,
        profile: enProfile,
        auth: enAuth,
        discovery: enDiscovery,
        products: enProducts,
        admin: enAdmin,
        stores: enStores,
      },
      ar: {
        common: ar,
        settings: arSettings,
        profile: arProfile,
        auth: arAuth,
        discovery: arDiscovery,
        products: arProducts,
        admin: arAdmin,
        stores: arStores,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

  await setLanguage(language);
};

export const setLanguage = async (languageCode: string) => {
  await i18n.changeLanguage(languageCode);
  await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);

  const rtl = supportedLanguages.find((l) => l.code === languageCode)?.rtl ?? true;

  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    console.log(`RTL changed to ${rtl}. App restart required.`);
  }
};

export const getCurrentLanguage = () => i18n.language;
export const isRTL = () => I18nManager.isRTL;

initI18n().catch((e) => {
  console.warn('i18n init failed:', e);
});

export default i18n;
