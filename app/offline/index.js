import { offline } from 'redux-offline';
import offlineConfig from 'redux-offline/lib/defaults';
import detectNetwork from 'redux-offline/lib/defaults/detectNetwork.native';
import { AsyncStorage } from 'react-native'; // eslint-disable-line import/no-unresolved
import { persistStore } from 'redux-persist';
import effect from './effect';

const persistNative = (store, options, callback) => (
  persistStore(store, { storage: AsyncStorage, ...options }, callback).purge() // .purge to clean the offline data
);

const config = params => ({
  ...offlineConfig,
  effect,
  detectNetwork,
  persist: persistNative,
  persistOptions: { blacklist: ['setup'] },
  persistCallback: params.persistCallback
});

export default params => offline(config(params));
