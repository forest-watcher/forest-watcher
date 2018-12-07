import 'react-native';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { combinedReducer } from 'combinedReducer';
import layerReducer, {
  cacheAreaLayer,
  cacheAreaBasemap,
  cacheLayers,
  downloadAreaById,
  getUserLayers,
  refreshAreaCacheById,
  resetCacheStatus,
  setActiveContextualLayer,
  syncLayers
} from 'redux-modules/layers';

describe('Redux Layers Module', () => {
  it('Initial reducer state', () => {
    expect(layerReducer(undefined, { type: 'NONE' })).toMatchSnapshot({ syncDate: expect.any(Number) });
  });

  describe('Redux Snapshot Thunk Actions', () => {
    let initialStoreState;
    let configuredStore;
    let store;

    beforeAll(() => {
      // todo move mock area(s)/layers out of tests.
      // create store
      initialStoreState = combinedReducer(undefined, { type: 'NONE' });
      configuredStore = configureStore([thunk]);
    });

    beforeEach(() => {
      // reset store state and clears actions
      store = configuredStore(initialStoreState);
    });

    // if changing this method, change in other tests too
    function mockDispatchAction(state, action, propertyMatcher, test = true) {
      const newStore = configuredStore({ layers: state });
      newStore.dispatch(action);
      const resolvedActions = newStore.getActions();
      let newState = state;
      // should only be one but the loop is used for future changes and so all tests conform.
      resolvedActions.forEach(resolvedAction => {
        newState = layerReducer(newState, resolvedAction);
      });
      if (test) {
        expect(resolvedActions).toMatchSnapshot();
        expect(newState).toMatchSnapshot(propertyMatcher);
      }
      return newState;
    }

    it('cacheAreaLayer', () => {
      store.dispatch(cacheAreaLayer('areaIDMock', 'layerIDMock'));
      expect(store.getActions()).toMatchSnapshot();

      const mockArea = {
        name: 'nameMock',
        id: 'areaIDMock',
        application: 'applicationMock', // used to test that all fields are included in payload
        geostore: { id: 'geostoreIDMock'}
      };
      const mockLayer = {
        url: 'urlMock',
        name: 'nameMock',
        id: 'layerIDMock',
      };
      store = configuredStore({
        ...initialStoreState,
        areas: { data: [mockArea] },
        layers: { data: [mockLayer] }
      });

      store.dispatch(cacheAreaLayer('areaIDMock', 'layerIDMock'));
      store.dispatch(cacheAreaLayer('areaIDMock1', 'layerIDMock1'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('cacheAreaBasemap', () => {
      store.dispatch(cacheAreaBasemap('areaIDMock'));
      expect(store.getActions()).toMatchSnapshot();

      const mockArea = {
        name: 'nameMock',
        id: 'areaIDMock',
        application: 'applicationMock', // used to test that all fields are included in payload
        geostore: { id: 'geostoreIDMock'}
      };
      store = configuredStore({
        ...initialStoreState,
        areas: { data: [mockArea] },
      });

      store.dispatch(cacheAreaBasemap('areaIDMock'));
      store.dispatch(cacheAreaBasemap('areaIDMock1'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('cacheLayers', () => {
      store.dispatch(cacheLayers());
      expect(store.getActions()).toMatchSnapshot();

      const mockArea = {
        name: 'nameMock',
        id: 'areaIDMock',
        application: 'applicationMock', // used to test that all fields are included in payload
        geostore: { id: 'geostoreIDMock'}
      };
      const mockLayer = {
        url: 'urlMock',
        name: 'nameMock',
        id: 'layerIDMock',
      };
      const mockPendingCache = {
        layerIDMock: {
          areaIDMock: false,
          areaIDMock2: false,
          mockAreaID: 'areaIDMock'
        },
        mockLayerID2: {
          areaIDMock: false,
          areaIDMock2: false,
          areaIDMock3: false,
          mockAreaID: 'areaIDMock'
        }
      };

      store = configuredStore({
        ...initialStoreState,
        areas: { data: [mockArea] },
        layers: {
          ...initialStoreState.layers,
          data: [mockLayer],
          pendingCache: mockPendingCache
        }
      });

      store.dispatch(cacheLayers());
      expect(store.getActions()).toMatchSnapshot();
    });

    it('downloadAreaById', () => {
      store.dispatch(downloadAreaById('areaIDMock'));
      expect(store.getActions()).toMatchSnapshot();

      const mockArea = {
        name: 'nameMock',
        id: 'areaIDMock',
        application: 'applicationMock', // used to test that all fields are included in payload
        geostore: { id: 'geostoreIDMock'}
      };
      store = configuredStore({
        ...initialStoreState,
        areas: { data: [mockArea] },
      });

      store.dispatch(downloadAreaById('areaIDMock'));
      store.dispatch(downloadAreaById('areaIDMock1'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('getUserLayers', () => {
      store.dispatch(getUserLayers());
      expect(store.getActions()).toMatchSnapshot();
    });

    it('setActiveContextualLayer', () => {
      store.dispatch(setActiveContextualLayer('layerMock', false));
      store.dispatch(setActiveContextualLayer('layerMock', true));
      store.dispatch(setActiveContextualLayer('layerMock', true));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('setActiveContextualLayer full test', () => {
      const propertyMatcher = { syncDate: expect.any(Number) };
      let newState = layerReducer(undefined, { type: 'NONE' });
      newState = mockDispatchAction(newState, setActiveContextualLayer('layerMock', false), propertyMatcher);
      newState = mockDispatchAction(newState, setActiveContextualLayer('layerMock', true), propertyMatcher);
      mockDispatchAction(newState, setActiveContextualLayer('layerMock', true), propertyMatcher);
    });
  });
});
