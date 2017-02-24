import I18n from 'react-native-i18n';

// Locales
import en from 'locales/en.json';
import es from 'locales/es.json';
import fr from 'locales/fr.json';
import pt from 'locales/pt.json';
import id from 'locales/id.json';

I18n.fallbacks = true;

I18n.translations = {
  en: { ...en },
  es: { ...es },
  fr: { ...fr },
  pt: { ...pt },
  id: { ...id }
};

export default I18n;
