import React from 'react';
import { AsyncStorage } from 'react-native';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { composeWithDevTools } from 'redux-devtools-extension';

import AppContainer from 'containers/app';
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
console.disableYellowBox = true;

// Show request in chrome network tool
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

const persistConfig = {
  storage: AsyncStorage,
  blacklist: ['navigation', 'setup']
};

export default class App extends React.Component {
  state = {
    rehydrated: false
  }

  componentWillMount() {
    persistStore(store, persistConfig, () => {
      this.setState({ rehydrated: true });
    });
  }

  render() {
    if (!this.state.rehydrated) return null;
    return (
      <Provider store={store}>
        <AppContainer />
      </Provider>
    );
  }
}
