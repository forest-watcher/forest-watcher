import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';
import detectNetwork from '@redux-offline/redux-offline/lib/defaults/detectNetwork.native';
import { AsyncStorage } from 'react-native'; // eslint-disable-line import/no-unresolved
import { persistStore } from 'redux-persist';
import { version } from 'package.json';
import { resetAlertsDb } from 'redux-modules/alerts';
import effect from './effect';
import retry from './retry';

const persistNative = (store, options, callback) => {
  AsyncStorage.getItem('reduxPersist:app', (err, appData) => {
    const getPersistedStore = () => persistStore(store, { storage: AsyncStorage, ...options }, callback);
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
  persist: persistNative,
  persistOptions: { blacklist: ['setup'] },
  persistCallback: params.persistCallback
});

export default params => offline(config(params));
