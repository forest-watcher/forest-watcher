import I18n from 'react-native-i18n';

// Locales
import en from 'locales/en.json';
import es from 'locales/es.json';
import fr from 'locales/fr.json';

I18n.fallbacks = true;

I18n.translations = {
  en: {...en},
  es: {...es},
  fr: {...fr}
};

export default I18n;
