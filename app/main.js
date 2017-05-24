import { Navigation } from 'react-native-navigation';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { offline } from 'redux-offline';
import offlineConfig from 'redux-offline/lib/defaults';
import persistNative from 'redux-offline/lib/defaults/persist.native';
import detectNetworkNative from 'redux-offline/lib/defaults/detectNetwork.native';

import Theme from 'config/theme';
import { registerScreens } from 'screens';

import * as reducers from 'redux-modules';

import Reactotron, { trackGlobalErrors, networking, openInEditor, asyncStorage } from 'reactotron-react-native'; // eslint-disable-line
import { reactotronRedux } from 'reactotron-redux'; // eslint-disable-line

// Disable ios warnings
// console.disableYellowBox = true;

// Show request in chrome network tool
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

export default () => {
  function startApp() {
    Navigation.startSingleScreenApp({
      screen: {
        screen: 'ForestWatcher.Home',
        navigatorStyle: Theme.navigator.styles
      }
    });
  }

  const offlineCustomConfig = {
    ...offlineConfig,
    rehydrate: true,
    persist: persistNative,
    detectNetwork: detectNetworkNative,
    persistOptions: {
      blacklist: ['setup']
    },
    persistCallback: () => { startApp(); }
  };

  const reducer = combineReducers(reducers);
  const enhancers = compose(
    applyMiddleware(thunk),
    offline(offlineCustomConfig)
  );
  let store = null;
  if (__DEV__) {
    Reactotron
      .configure()
      .use(reactotronRedux())
      .use(trackGlobalErrors())
      .use(networking())
      .use(openInEditor())
      .use(asyncStorage())
      .connect()
      .clear();
    store = Reactotron.createStore(reducer, undefined, enhancers);
  } else {
    store = createStore(reducer, undefined, enhancers);
  }

  registerScreens(store, Provider);
};
