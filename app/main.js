// eslint-disable-next-line import/default
import codePush from 'react-native-code-push';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import Theme from 'config/theme';
import { registerScreens } from 'screens';
import createStore from 'store';
import { setupCrashLogging } from './crashes';

import { configureLocationFramework } from 'helpers/location';

// Disable ios warnings
// console.disableYellowBox = true;

// Show request in chrome network tool
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.MANUAL,
  installMode: codePush.InstallMode.ON_NEXT_RESUME
};

export default class App {
  constructor() {
    this.store = null;
  }

  configureCodePush() {
    const codepushEnable = !__DEV__;
    if (codepushEnable) {
      codePush.sync(codePushOptions);
    }
  }

  async launchRoot() {
    await Navigation.setDefaultOptions({
      ...Theme.navigator.styles
    });

    const state = this.store.getState();
    let screen = 'ForestWatcher.Home';
    if (state.user.loggedIn && state.app.synced) {
      screen = 'ForestWatcher.Dashboard';
    }

    await launchAppRoot(screen);
  }

  /**
   * Performs one-time setup tasks needed to launch the application
   *
   * If called further times it will only setup the UI
   */
  async setupApp() {
    // If we've already setup the app then store will be non-null, and we just need to launch a UI root
    if (this.store) {
      this.launchRoot();
      return;
    }

    if (!__DEV__) {
      await setupCrashLogging();
    }

    const store = createStore(async () => {
      this.store = store;
      registerScreens(store, Provider);
      configureLocationFramework();
      this.configureCodePush();
      createStore.runSagas();
      await this.launchRoot();
    });
  }
}

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
