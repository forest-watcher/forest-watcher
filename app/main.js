// eslint-disable-next-line import/default
import codePush from 'react-native-code-push';
import { Alert, AppState, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import Theme from 'config/theme';
import { registerScreens } from 'screens';
import createStore from 'store';
import { setupCrashLogging } from './crashes';
import i18n from 'locales';

import {
  GFWLocationAuthorizedAlways,
  initialiseLocationFramework,
  checkLocationStatus,
  showAppSettings,
  showLocationSettings
} from 'helpers/location';

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
    this.currentAppState = "background";

    AppState.addEventListener('change', this._handleAppStateChange);
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

  _handleAppStateChange = async nextAppState => {
    if (this.currentAppState.match(/inactive|background/) && nextAppState === 'active') {
      const locationStatus = await checkLocationStatus();
      if (
        this.store.getState().routes.activeRoute &&
        (!locationStatus.isRunning ||
          !locationStatus.locationServicesEnabled ||
          locationStatus.authorization !== GFWLocationAuthorizedAlways)
      ) {
        // TODO: add logic to restart / save / delete - for now just show the settings.
        Alert.alert(
          i18n.t('routes.backgroundErrorDialogTitle'),
          i18n.t('routes.backgroundErrorDialogMessage'),
          [
            { text: i18n.t('commonText.ok') },
            {
              text: i18n.t('routes.insufficientPermissionsDialogOpenAppSettings'),
              onPress: showAppSettings
            },
            ...Platform.select({
              android: [
                {
                  text: i18n.t('routes.insufficientPermissionsDialogOpenDeviceSettings'),
                  onPress: showLocationSettings
                }
              ],
              ios: [{}]
            })
          ]
        );
      }
    }

    this.currentAppState = nextAppState;
  };

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
      initialiseLocationFramework();
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
