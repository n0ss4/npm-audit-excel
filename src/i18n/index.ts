import i18next from 'i18next';
import type { LanguageCode, TranslationOptions, I18nFunction } from '../types';
import en from './locales/en.json';
import es from './locales/es.json';

const SUPPORTED_LANGUAGES: readonly LanguageCode[] = ['en', 'es'] as const;

export async function initI18n(language: LanguageCode = 'en'): Promise<void> {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(
      `Unsupported language: ${language}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`
    );
  }

  await i18next.init({
    lng: language,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
  });
}

export const t: I18nFunction = (key: string, options?: TranslationOptions): string =>
  i18next.t(key, options);

export const changeLanguage = async (language: LanguageCode): Promise<void> => {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(
      `Unsupported language: ${language}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`
    );
  }
  await i18next.changeLanguage(language);
};

export const getCurrentLanguage = (): LanguageCode => {
  const currentLang = i18next.language;
  return SUPPORTED_LANGUAGES.includes(currentLang as LanguageCode)
    ? (currentLang as LanguageCode)
    : 'en';
};

export const getSupportedLanguages = (): readonly LanguageCode[] => SUPPORTED_LANGUAGES;
