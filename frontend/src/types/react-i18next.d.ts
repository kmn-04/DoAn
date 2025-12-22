declare module 'react-i18next' {
  import type { i18n } from 'i18next';

  export const initReactI18next: unknown;

  export function useTranslation(namespace?: string): {
    t: (key: string, options?: Record<string, unknown>) => string;
    i18n: i18n;
  };
}


