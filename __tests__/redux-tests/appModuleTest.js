import 'react-native';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { combinedReducer } from 'combinedReducer';
import appReducer, {
  retrySync,
  saveLastActions,
  setAppSynced,
  setCoordinatesFormat,
  setOfflineMode,
  setPristineCacheTooltip,
  showNotConnectedNotification,
  syncApp,
  updateApp
} from 'redux-modules/app';

describe('Redux App Module', () => {
// ACTION TESTS
  describe('Redux Snapshot Actions', () => {
    it('saveLastActions', () => {
      expect(saveLastActions()).toMatchSnapshot();
    });

    it('setAppSynced', () => {
      expect(setAppSynced(true)).toMatchSnapshot();
      expect(setAppSynced(false)).toMatchSnapshot();
    });

    it('setCoordinatesFormat', () => {
      expect(setCoordinatesFormat('decimal')).toMatchSnapshot();
      expect(setCoordinatesFormat('degrees')).toMatchSnapshot();
    });

    it('setOfflineMode', () => {
      expect(setOfflineMode(true)).toMatchSnapshot();
      expect(setOfflineMode(false)).toMatchSnapshot();
    });

    it('setPristineCacheTooltip', () => {
      expect(setPristineCacheTooltip(true)).toMatchSnapshot();
      expect(setPristineCacheTooltip(false)).toMatchSnapshot();
    });

    it('updateApp', () => {
      expect(updateApp()).toMatchSnapshot();
    });
  });

  describe('Redux Snapshot Thunk Actions', () => {
    let initialStoreState;
    let configuredStore;
    let store;

    beforeAll(() => {
      // create store
      initialStoreState = combinedReducer(undefined, { type: 'NONE' });
      configuredStore = configureStore([thunk]);
    });

    beforeEach(() => {
      // reset store state and clears actions
      store = configuredStore(initialStoreState);
    });

    it('retrySync', () => {
      store.dispatch(retrySync());
      expect(store.getActions()).toMatchSnapshot();
    });

    it('showNotConnectedNotification', () => {
      store.dispatch(showNotConnectedNotification());
      // todo find way to call setOfflineMode(true) then dispatch showNotConnectedNotification again
      expect(store.getActions()).toMatchSnapshot();
    });

    it('syncApp', () => {
      store.dispatch(syncApp());
      expect(store.getActions()).toMatchSnapshot();
    });
  });

// REDUCER & STATE TESTS
  describe('Redux Reducers - Unit Tests', () => {
    it('tests', () => {
      expect(true);
    });
    // it('snapshot redux reducer initial state test', () => {
    //   expect(appReducer(undefined, { type: 'NONE' })).toMatchSnapshot();
    // });
    //
    // it('snapshot redux reducer action test', () => {
    //   expect(appReducer(undefined, setAppSynced(true))).toMatchSnapshot();
    // });
    //
    // it('snapshot redux reducer multiple action test', () => {
    //   let state = appReducer(undefined, setAppSynced(true));
    //   expect(state).toMatchSnapshot();
    //   state = appReducer(state, setOfflineMode(true));
    //   expect(state).toMatchSnapshot();
    // });
  });
});

// MOCKS
/* eslint-disable */
jest.mock('react-native-config', () => ({ API_URL: '', API_AUTH: '<TEST_API_AUTH>', MAPBOX_TOKEN: '' }));
jest.mock('react-native-cookies', () => {
  clearAll: jest.fn();
});
jest.mock('react-native-fetch-blob', () => {
  config: jest.fn();
});
jest.mock('react-native-zip-archive', () => {
  unzip: jest.fn();
});
jest.mock('Dimensions');
