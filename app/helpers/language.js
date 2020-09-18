// @flow

import { getLocale } from '../locales/';

export function getLanguage(): string {
  let lang = getLocale();
  if (lang.indexOf('-') !== -1) {
    lang = lang.split('-')[0];
  }
  return lang;
}
