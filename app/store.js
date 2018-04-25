import * as reducers from 'redux-modules';
import { createStore, compose, combineReducers, applyMiddleware } from 'redux';
import offline from 'offline';
import thunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './sagas';

import Reactotron, { trackGlobalErrors, networking, openInEditor, asyncStorage } from 'reactotron-react-native'; // eslint-disable-line
import { reactotronRedux } from 'reactotron-redux'; // eslint-disable-line

const authMiddleware = ({ getState }) => next => action => (
  action.type && action.type.endsWith('REQUEST') ? next({ ...action, auth: getState().user.token }) : next(action)
);

export const sagaMiddleware = createSagaMiddleware();

const middlewareList = [thunk, authMiddleware, sagaMiddleware];

const reducer = combineReducers(reducers);

function createAppStore(startApp) {
  const {
    middleware: offlineMiddleware,
    enhanceReducer,
    enhanceStore
  } = offline({ persistCallback: startApp });
  const middleware = applyMiddleware(...middlewareList, offlineMiddleware);
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
    return Reactotron.createStore(enhanceReducer(reducer), compose(middleware, enhanceStore));
  }
  return createStore(enhanceReducer(reducer), compose(middleware, enhanceStore));
}

createAppStore.runSagas = () => sagaMiddleware.run(rootSaga);


export default createAppStore;
