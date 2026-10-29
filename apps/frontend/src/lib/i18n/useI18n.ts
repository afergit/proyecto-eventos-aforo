import { create } from 'zustand';
import { es, en, type Locale, type TranslationDict } from './translations';

interface I18nState {
  locale: Locale;
  t: TranslationDict;
  setLocale: (locale: Locale) => void;
}

const dictionaries: Record<Locale, TranslationDict> = { es, en };

export const useI18nStore = create<I18nState>((set) => ({
  locale: 'es',
  t: es,
  setLocale: (locale: Locale) => {
    set({
      locale,
      t: dictionaries[locale] || es
    });
  }
}));
