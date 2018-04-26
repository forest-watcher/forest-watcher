import { AsyncStorage } from 'react-native';
import { createOffline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';
import persistNative from '@redux-offline/redux-offline/lib/defaults/persist.native';
import detectNetwork from '@redux-offline/redux-offline/lib/defaults/detectNetwork.native';
import { version } from 'package.json';  // eslint-disable-line
import { resetAlertsDb } from 'redux-modules/alerts';
import effect from './effect';
import retry from './retry';

const persistStore = (store, options, callback) => {
  AsyncStorage.getItem('reduxPersist:app', (err, appData) => {
    const getPersistedStore = () => persistNative(store, options, callback);
    let app = null;
    if (!err) {
      app = JSON.parse(appData);
    }
    if (app && app.version !== version) {
      getPersistedStore().purge();
      resetAlertsDb();
    } else {
      getPersistedStore(); // .purge to clean the offline data
    }
  });
};

const config = params => ({
  ...offlineConfig,
  effect,
  retry,
  detectNetwork,
  persist: persistStore,
  persistOptions: { blacklist: ['setup'] },
  persistCallback: params.persistCallback
});

export default params => createOffline(config(params));
