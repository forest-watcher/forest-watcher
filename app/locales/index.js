import I18n from 'react-native-i18n';

// Locales
import en from 'locales/en';
import es from 'locales/es';
import fr from 'locales/fr';

I18n.fallbacks = true;

I18n.translations = {
  ...en,
  ...es,
  ...fr
};

export default I18n;
