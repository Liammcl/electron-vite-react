import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './messages/en.json';
import cn from './messages/cn.json';
import tw from './messages/tw.json';

export const langList = [
    {
      name: "English",
      code: "en",
      iso:'en-US'
    },
    {
      name: "简体中文",
      code: "cn",
      iso:'zh-CN'
    },
    {
      name: "繁體中文",
      code: "tw",
      iso:'zh-TW'
    }
  ]
export const i18n = i18next;
i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "tw",
  debug: false,
  interpolation: {
    escapeValue: false
  },
  resources: {
    'zh-CN': { translation:cn },
    'zh-TW': { translation: tw },
    'en': { translation: en },
  },
})



