import { createStore, compose, applyMiddleware } from 'redux';
import { combinedReducer } from 'combinedReducer';
import offline from 'offline';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import Reactotron, { trackGlobalErrors, networking, openInEditor, asyncStorage } from 'reactotron-react-native'; // eslint-disable-line
import sagaPlugin from 'reactotron-redux-saga';// eslint-disable-line
import { reactotronRedux } from 'reactotron-redux'; // eslint-disable-line

import migrationEnhancer from './migrate';

import { rootSaga } from 'sagas';

if (__DEV__) {
  Reactotron.configure()
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

const authMiddleware = ({ getState }) => next => action =>
  action && action.type && action.type.endsWith('REQUEST')
    ? next({ ...action, auth: getState().user.token })
    : next(action);

const middlewareList = [thunk, authMiddleware, sagaMiddleware];

function createAppStore(startApp) {
  const { middleware: offlineMiddleware, enhanceReducer, enhanceStore } = offline({
    persistCallback: startApp
  });
  const middleware = applyMiddleware(...middlewareList, offlineMiddleware);
  const storeEnhancers = [enhanceStore, migrationEnhancer, middleware];
  if (__DEV__) {
    storeEnhancers.unshift(Reactotron.createEnhancer());
  }
  return createStore(enhanceReducer(combinedReducer), compose(...storeEnhancers));
}

createAppStore.runSagas = () => sagaMiddleware.run(rootSaga);

export default createAppStore;
