import { Component } from 'react';
import { Navigation } from 'react-native-navigation';
import { AsyncStorage } from 'react-native';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { composeWithDevTools } from 'redux-devtools-extension';

import Theme from 'config/theme';
import { registerScreens } from 'screens';

import * as reducers from 'redux-modules';

const reducer = combineReducers(reducers);
const store = createStore(
  reducer,
  undefined,
  composeWithDevTools(
    applyMiddleware(thunk),
    autoRehydrate()
  )
);

// Disable ios warnings
// console.disableYellowBox = true;

// Show request in chrome network tool
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

const persistConfig = {
  storage: AsyncStorage,
  blacklist: ['setup']
};

registerScreens(store, Provider);

function startApp() {
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'ForestWatcher.Home',
      navigatorStyle: Theme.navigator.styles
    }
  });
}

class App extends Component {
  constructor() {
    super();
    persistStore(store, persistConfig, () => {
      startApp();
    });
  }
}

export default App;
