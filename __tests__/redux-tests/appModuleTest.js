import 'react-native';
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
    it('retrySync', () => { // todo thunk
      expect(retrySync()).toMatchSnapshot();
    });

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

    it('showNotConnectedNotification', () => { // todo thunk
      expect(showNotConnectedNotification()).toMatchSnapshot();
    });

    it('syncApp', () => { // todo thunk
      expect(syncApp()).toMatchSnapshot();
    });

    it('updateApp', () => {
      expect(updateApp()).toMatchSnapshot();
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
jest.mock('react-native-config', () => ({ API_URL: '', MAPBOX_TOKEN: '' }));
jest.mock('react-native-cookies', () => {clearAll: jest.fn();});
jest.mock('react-native-fetch-blob', () => {config: jest.fn();});
jest.mock('react-native-zip-archive', () => {unzip: jest.fn();});
jest.mock('Dimensions');
