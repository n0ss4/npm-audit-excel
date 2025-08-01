import i18next from 'i18next';
import en from './locales/en.json';
import es from './locales/es.json';

export async function initI18n(language: string = 'en'): Promise<void> {
  await i18next.init({
    lng: language,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      es: { translation: es }
    }
  });
}

export const t = (key: string, options?: Record<string, unknown>): string => i18next.t(key, options);
export const changeLanguage = async (language: string): Promise<void> => {
  await i18next.changeLanguage(language);
};
