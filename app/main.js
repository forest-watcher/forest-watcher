import { Alert, AppState, NativeModules, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';
import Theme from 'config/theme';
import { registerScreens } from 'screens';
import createStore from 'store';
import { setupCrashLogging } from './crashes';
import { setI18nConfig } from 'locales';
import i18n from 'i18next';

import {
  GFWLocationAuthorizedAlways,
  initialiseLocationFramework,
  checkLocationStatus,
  showAppSettings,
  showLocationSettings,
  startTrackingLocation
} from 'helpers/location';
import { discardActiveRoute } from 'redux-modules/routes';
import Config from 'react-native-config';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { trackRouteFlowEvent } from 'helpers/analytics';
import { launchAppRoot } from 'screens/common';
import { migrateFilesFromV1ToV2 } from './migrate';
import { SET_HAS_MIGRATED_V1_FILES } from 'redux-modules/app';
import Sentry from "@sentry/react-native";

// Disable ios warnings
// console.disableYellowBox = true;

// Show request in chrome network tool
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

// eslint-disable-next-line import/no-unused-modules
export default class App {
  constructor() {
    this.store = null;
    this.currentAppState = 'background';
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  async launchRoot() {
    setI18nConfig();

    await Navigation.setDefaultOptions({
      ...Theme.navigator.styles
    });

    const state = this.store.getState();
    let screen = 'ForestWatcher.Home';
    if (state.user.loggedIn && state.app.synced) {
      screen = 'ForestWatcher.Dashboard';
    }

    if (Platform.OS === 'android') {
      NativeModules.FWMapbox.installOfflineModeInterceptor(state.app.offlineMode);
    }

    await launchAppRoot(screen);
    await this._handleAppStateChange('active');

    try {
      const hasMigratedFiles = state.app.hasMigratedV1Files;
      if (!hasMigratedFiles) {
        await migrateFilesFromV1ToV2(this.store.dispatch);
        this.store.dispatch({
          type: SET_HAS_MIGRATED_V1_FILES
        });
      }
    } catch (err) {
      console.warn('3SC', 'Could not migrate files', err);
      Sentry.captureException(err);
    }
  }

  _handleAppStateChange = async nextAppState => {
    // As this can be called before the store is initialised, ensure we have a store before continuing.
    if (!this.store) {
      return;
    }

    const hasTransitionedToForeground = this.currentAppState.match(/inactive|background/) && nextAppState === 'active';
    this.currentAppState = nextAppState;

    if (!hasTransitionedToForeground) {
      return;
    }

    const activeRoute = this.store.getState().routes.activeRoute;

    // If there was no active route then we are done
    if (!activeRoute) {
      return;
    }

    // If we have an active route in state it means we should be tracking locations for it...
    const locationStatus = await checkLocationStatus();
    let trackingIsBlocked = false;

    // If the tracker is not currently running then find out what the user wants to do and possibly start it
    if (!locationStatus.isRunning) {
      // Ask the user if they want to resume tracking
      const shouldResume = await new Promise(resolve => {
        Alert.alert(i18n.t('routes.resumeTrackingDialogTitle'), i18n.t('routes.resumeTrackingDialogMessage'), [
          { text: i18n.t('routes.resumeTrackingDialogPositiveButton'), onPress: () => resolve(true) },
          {
            text: i18n.t('routes.resumeTrackingDialogNegativeButton'),
            onPress: () => resolve(false)
          }
        ]);
      });

      if (!shouldResume) {
        trackRouteFlowEvent('discardedOnLaunch');
        this.store.dispatch(discardActiveRoute());
        return;
      }

      // Attempt to start tracking. If it succeeds then we are done
      try {
        await startTrackingLocation(GFWLocationAuthorizedAlways);
        return;
      } catch (err) {
        // Could not start tracking after resuming from background - tell the user to fix their settings
        trackingIsBlocked = true;
      }
    } else {
      trackingIsBlocked =
        !locationStatus.locationServicesEnabled || locationStatus.authorization !== GFWLocationAuthorizedAlways;
    }

    // Show a message saying tracking is paused until they fix the problem, along with buttons to take them to app settings.
    if (trackingIsBlocked) {
      Alert.alert(i18n.t('routes.backgroundErrorDialogTitle'), i18n.t('routes.backgroundErrorDialogMessage'), [
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
      ]);
    }
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
      MapboxGL.setAccessToken(Config.MAPBOX_TOKEN);
      createStore.runSagas();
      await this.launchRoot();
    });
  }
}
