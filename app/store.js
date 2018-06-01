import * as reducers from 'redux-modules';
import { createStore, compose, combineReducers, applyMiddleware } from 'redux';
import offline from 'offline';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import Reactotron, { trackGlobalErrors, networking, openInEditor, asyncStorage } from 'reactotron-react-native'; // eslint-disable-line
import sagaPlugin from 'reactotron-redux-saga';// eslint-disable-line
import { reactotronRedux } from 'reactotron-redux'; // eslint-disable-line

import { rootSaga } from 'sagas';

if (__DEV__) {
  Reactotron
    .configure()
    .use(reactotronRedux())
    .use(sagaPlugin())
    .use(trackGlobalErrors())
    .use(networking())
    .use(openInEditor())
    .use(asyncStorage())
    .connect()
    .clear();
  window.tron = Reactotron; // eslint-disable-line
}

const sagaMonitor = __DEV__ && Reactotron.createSagaMonitor();
const sagaMiddleware = createSagaMiddleware({ sagaMonitor });

const authMiddleware = ({ getState }) => next => action => (
  action && action.type && action.type.endsWith('REQUEST') ? next({ ...action, auth: getState().user.token }) : next(action)
);

const middlewareList = [thunk, authMiddleware, sagaMiddleware];

const reducer = combineReducers(reducers);

function createAppStore(startApp) {
  let storeCreator = createStore;
  const {
    middleware: offlineMiddleware,
    enhanceReducer,
    enhanceStore
  } = offline({ persistCallback: startApp });
  const middleware = applyMiddleware(...middlewareList, offlineMiddleware);
  if (__DEV__) {
    storeCreator = Reactotron.createStore;
  }
  return storeCreator(
    enhanceReducer(reducer),
    compose(enhanceStore, middleware)
  );
}

createAppStore.runSagas = () => sagaMiddleware.run(rootSaga);

export default createAppStore;
