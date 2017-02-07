import React from 'react';
import { AsyncStorage } from 'react-native';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { composeWithDevTools } from 'redux-devtools-extension';

import AppContainer from 'containers/app';
import * as reducers from 'redux-modules';

import { StackNavigator } from 'react-navigation';
import { Routes, RoutesConfig } from 'routes';

export const AppNavigator = StackNavigator(Routes, RoutesConfig);

const reducer = combineReducers(reducers);
const store = createStore(
  reducer,
  undefined,
  composeWithDevTools(
    applyMiddleware(thunk),
    autoRehydrate()
  )
);

// Add `autoRehydrate()`  in the compose once redux-persist works on Android
console.disableYellowBox = true;

export default class App extends React.Component {
  componentWillMount() {
    persistStore(store, { storage: AsyncStorage }).purge(['navigation']);
  }

  render() {
    return (
      <Provider store={store}>
        <AppContainer />
      </Provider>
    );
  }
}
