import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import fr from './locales/fr.json';

const LANGUAGE_KEY = '@kanteen:language';

const getDeviceLanguage = () => {
    try {
        const locales = Localization.getLocales();
        const deviceLang = locales[0]?.languageCode || 'en';
        return ['en', 'fr'].includes(deviceLang) ? deviceLang : 'en';
    } catch (e) {
        return 'en';
    }
};

// Initialize i18next
i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            fr: { translation: fr },
        },
        lng: getDeviceLanguage(), // Synchronous default to prevent flicker if waiting
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // React already escapes
        },
        react: {
            useSuspense: false,
        },
    });

/**
 * Loads the saved language preference from AsyncStorage.
 * MUST be awaited in app/_layout.tsx alongside font loading.
 */
export const initLanguage = async (): Promise<void> => {
    try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLang && ['en', 'fr'].includes(savedLang)) {
            await i18n.changeLanguage(savedLang);
        } else {
            // Apply device language just to be sure (sync init usually covers this)
            await i18n.changeLanguage(getDeviceLanguage());
        }
    } catch (error) {
        console.warn('Failed to load language preference:', error);
    }
};

export const setLanguage = async (lang: 'en' | 'fr') => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
};

export default i18n;
