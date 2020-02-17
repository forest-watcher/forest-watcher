// @flow

import i18n from 'i18next';
import * as RNLocalize from 'react-native-localize';
import { I18nManager } from 'react-native';

export function getLocale(): string {
  const locales = RNLocalize.getLocales();
  return locales[0].languageTag;
}

/**
 * setI18nConfig - Performs localisation setup, so that the correct language text is used in the UI!
 * This is largely based off of the example here: https://github.com/react-native-community/react-native-localize/blob/master/example/src/SyncExample.js.
 */
export const setI18nConfig = () => {
  // Lazy requires of each language available in the app.
  // When there's more languages available, add them in here & if the device is in the right language, it should automatically use those strings ✨
  const translationPaths = {
    en: () => require('./en.json'),
    es: () => require('./es.json'),
    fr: () => require('./fr.json'),
    id: () => require('./id.json'),
    pt: () => require('./pt.json')
  };

  // Determine the best language based on the supported locales defined in translationPaths, falling back to EN if none better are available.
  const fallback = { languageTag: 'en', isRTL: false };
  const { languageTag, isRTL } = RNLocalize.findBestAvailableLanguage(Object.keys(translationPaths)) || fallback;

  // Tell react-native if this is a right-to-left language.
  I18nManager.forceRTL(isRTL);

  // Configure i18n, with the chosen translations & locale.
  i18n.init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    lng: languageTag,
    resources: {
      en: translationPaths.en(),
      es: translationPaths.es(),
      fr: translationPaths.fr(),
      id: translationPaths.id(),
      pt: translationPaths.pt()
    }
  });
};
