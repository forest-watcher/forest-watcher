import { Navigation } from 'react-native-navigation';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import Theme from 'config/theme';
import { registerScreens } from 'screens';

import * as reducers from 'redux-modules';
import offline from 'offline';

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

  const authMiddleware = ({ getState }) => next => action => next({ ...action, auth: getState().user.token });

  const reducer = combineReducers(reducers);
  const middleware = applyMiddleware(thunk, authMiddleware);

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
    store = offline({ persistCallback: startApp })(Reactotron.createStore)(reducer, undefined, middleware);
  } else {
    store = offline({ persistCallback: startApp })(createStore)(reducer, undefined, middleware);
  }

  registerScreens(store, Provider);
};
