import { createOffline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';
import persistNative from '@redux-offline/redux-offline/lib/defaults/persist.native';
import detectNetwork from './detectNetwork';
import discard from './discard';
import effect from './effect';
import retry from './retry';

const migrationTransform = {
  in: x => x,
  out: (subState, key) => subState // eslint-disable-line
};

const config = params => ({
  ...offlineConfig,
  discard,
  effect,
  retry,
  detectNetwork,
  persist: (...options) => persistNative(...options), // .purge()
  persistOptions: { blacklist: ['setup'], transforms: [migrationTransform] },
  persistCallback: params.persistCallback
});

export default params => createOffline(config(params));
