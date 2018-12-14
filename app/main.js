// eslint-disable-next-line import/default
import codePush from 'react-native-code-push';
import { Sentry } from 'react-native-sentry';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import Theme from 'config/theme';
import { registerScreens } from 'screens';
import createStore from 'store';
import { setupCrashLogging } from './crashes';

// Disable ios warnings
// console.disableYellowBox = true;

// Show request in chrome network tool
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.MANUAL,
  installMode: codePush.InstallMode.ON_NEXT_RESUME
};

function setCodePush() {
  const codepushEnable = !__DEV__;
  if (codepushEnable) {
    codePush.sync(codePushOptions);
    codePush.getUpdateMetadata().then(update => {
      if (update) {
        Sentry.setVersion(update.appVersion + '-codepush:' + update.label);
      }
    });
  }
}

const app = async () => {
  if (!__DEV__) {
    await setupCrashLogging();
  }

  const store = createStore(startApp);
  registerScreens(store, Provider);

  async function startApp() {
    const state = store.getState();
    let screen = 'ForestWatcher.Home';
    if (state.user.loggedIn && state.app.synced) {
      screen = 'ForestWatcher.Dashboard';
    }

    await Navigation.setDefaultOptions({
      ...Theme.navigator.styles
    });

    await launchAppRoot(screen);
    setCodePush();

    createStore.runSagas();
  }
};

export function launchAppRoot(screen) {
  return Navigation.setRoot({
    root: {
      sideMenu: {
        center: {
          stack: {
            children: [
              {
                component: {
                  name: screen
                }
              }
            ]
          }
        },
        right: {
          component: {
            name: 'ForestWatcher.RightDrawer',
            passProps: {}
          }
        }
      }
    }
  });
}

export default app;
