import { Platform, UIManager } from 'react-native';
import { Navigation } from 'react-native-navigation';

import App from './app/main';

// Enable animations on Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

const app = new App();

// We'll setup the app whenever RNN tells us the app has safely launched
// See https://wix.github.io/react-native-navigation/#/docs/app-launch
Navigation.events().registerAppLaunchedListener(() => {
  app.setupApp();
});

export default app;
