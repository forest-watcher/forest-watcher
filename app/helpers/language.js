import i18n from 'react-native-i18n';

export function getLanguage() {
  let lang = i18n.locale;
  if (lang.indexOf('-') !== -1) {
    lang = lang.split('-')[0];
  }
  return lang;
}
