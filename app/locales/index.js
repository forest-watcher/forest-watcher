import i18n from 'react-native-i18n';

// Locales
import en from 'locales/en.json';
import es from 'locales/es.json';
import fr from 'locales/fr.json';
import pt from 'locales/pt.json';
import id from 'locales/id.json';

i18n.fallbacks = true;

if (i18n.locale.indexOf('in') >= 0) {
  i18n.locale = 'id';
}

i18n.translations = {
  en: { ...en },
  es: { ...es },
  fr: { ...fr },
  pt: { ...pt },
  id: { ...id }
};

export default i18n;
