import codePush from 'react-native-code-push';
import { Navigation } from 'react-native-navigation';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import Theme from 'config/theme';
import { registerScreens } from 'screens';

import * as reducers from 'redux-modules';
import { SAVE_LAST_ACTIONS } from 'redux-modules/app';
import offline from 'offline';

import Reactotron, { trackGlobalErrors, networking, openInEditor, asyncStorage } from 'reactotron-react-native'; // eslint-disable-line
import { reactotronRedux } from 'reactotron-redux'; // eslint-disable-line
import { setExceptionHandlers, checkPrevCrashes } from './crashes';

// Disable ios warnings
// console.disableYellowBox = true;

// Show request in chrome network tool
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;


const app = () => {
  let store = null;

  function startApp() {
    Navigation.startSingleScreenApp({
      screen: {
        screen: 'ForestWatcher.Home',
        navigatorStyle: Theme.navigator.styles
      },
      drawer: {
        right: {
          screen: 'ForestWatcher.RightDrawer',
          passProps: {}
        },
        disableOpenGesture: true
      },
      appStyle: {
        orientation: 'portrait'
      }
    });
    setExceptionHandlers(store);
    checkPrevCrashes();
  }

  const authMiddleware = ({ getState }) => next => action => (
    action.type && action.type.endsWith('REQUEST') ? next({ ...action, auth: getState().user.token }) : next(action)
  );

  const lastActionsMiddleware = ({ dispatch }) => next => action => {
    if (action.type !== SAVE_LAST_ACTIONS || action.type.startsWith('user/')) {
      dispatch({ type: SAVE_LAST_ACTIONS, payload: action });
    }
    return next(action);
  };

  const reducer = combineReducers(reducers);

  const middlewareList = [thunk, authMiddleware];
  if (!__DEV__) middlewareList.push(lastActionsMiddleware);
  const middleware = applyMiddleware(...middlewareList);

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
    window.tron = Reactotron; // eslint-disable-line
    store = offline({ persistCallback: startApp })(Reactotron.createStore)(reducer, undefined, middleware);
  } else {
    const codePushOptions = {
      checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
      installMode: codePush.InstallMode.ON_NEXT_RESUME
    };
    codePush.sync(codePushOptions);
    store = offline({ persistCallback: startApp })(createStore)(reducer, undefined, middleware);
  }

  registerScreens(store, Provider);
};

export default app;
