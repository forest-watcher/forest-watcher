import { offline } from 'redux-offline';
import offlineConfig from 'redux-offline/lib/defaults';
import { AsyncStorage } from 'react-native'; // eslint-disable-line import/no-unresolved
import { persistStore } from 'redux-persist';
import effect from './effect';
import detectNetwork from './detectNetwork';

const persistNative = (store, options, callback) => (
  persistStore(store, { storage: AsyncStorage, ...options }, callback) // .purge to clean the offline data
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
