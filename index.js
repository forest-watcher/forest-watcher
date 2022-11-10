import { Platform, UIManager, StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';
import App from './app/main';
import { disableAnalytics } from 'helpers/analytics';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

global.Buffer = global.Buffer || require('buffer').Buffer;

// Don't enable animation support on Android, as it was causing strange UI issues (see https://3sidedcube.atlassian.net/browse/GFW-370)
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(false);
}

if (Platform.OS === 'ios') {
  StatusBar.setBarStyle('dark-content');
}

disableAnalytics(__DEV__);

const app = new App();

// We'll setup the app whenever RNN tells us the app has safely launched
// See https://wix.github.io/react-native-navigation/#/docs/app-launch
Navigation.events().registerAppLaunchedListener(() => {
  app.setupApp();
});

export default app;
