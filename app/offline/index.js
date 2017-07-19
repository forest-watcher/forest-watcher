import { offline } from 'redux-offline';
import offlineConfig from 'redux-offline/lib/defaults';
import detectNetwork from 'redux-offline/lib/defaults/detectNetwork.native';
import { AsyncStorage } from 'react-native'; // eslint-disable-line import/no-unresolved
import { persistStore } from 'redux-persist';
import { version } from 'package.json';
import effect from './effect';

const persistNative = (store, options, callback) => {
  AsyncStorage.getItem('reduxPersist:app')
    .then((app) => {
      const getPersistedStore = () => persistStore(store, { storage: AsyncStorage, ...options }, callback); // .purge to clean the offline data
      if (app.version !== version) {
        getPersistedStore().purge();
      } else {
        getPersistedStore();
      }
    });
};

const config = params => ({
  ...offlineConfig,
  effect,
  detectNetwork,
  persist: persistNative,
  persistOptions: { blacklist: ['setup'] },
  persistCallback: params.persistCallback
});

export default params => offline(config(params));
