import React from 'react';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import AppContainer from 'containers/app';
import * as reducers from 'redux-modules';

const reducer = combineReducers(reducers);
const store = createStore(
  reducer,
  compose(
    applyMiddleware(thunk),
    global.reduxNativeDevTools ? global.reduxNativeDevTools() : nope => nope
  )
);

export default function App() {
  return (
    <Provider store={store}>
      <AppContainer />
    </Provider>
  );
}
