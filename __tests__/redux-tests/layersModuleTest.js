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
  refreshCacheById,
  resetCacheStatus,
  syncLayers
} from 'redux-modules/layers';

describe('Redux Layers Module', () => {
  // Mock Objects:
  const mockArea = {
    name: 'nameMock',
    id: 'areaIDMock',
    application: 'applicationMock', // used to test that all fields are included in payload
    geostore: { id: 'geostoreIDMock' }
  };

  const mockRoute = {
    id: 'routeIDMock',
    areaId: 'areaIDMock',
    geostoreId: 'geostoreIDMock',
    name: 'routeNameMock'
  };

  const mockLayer = {
    url: 'urlMock',
    name: 'nameMock',
    id: 'layerIDMock'
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

  it('Initial reducer state', () => {
    expect(layerReducer(undefined, { type: 'NONE' })).toMatchSnapshot({ syncDate: expect.any(Number) });
  });

  describe('Redux Snapshot Thunk Actions', () => {
    let initialStoreState;
    let populatedStoreState;
    let configuredStore;
    let store;

    beforeAll(() => {
      // create store
      initialStoreState = combinedReducer(undefined, { type: 'NONE' });
      populatedStoreState = {
        ...initialStoreState,
        areas: {
          ...initialStoreState.areas,
          data: [mockArea]
        },
        layers: {
          ...initialStoreState.layers,
          data: [mockLayer],
          pendingCache: mockPendingCache
        },
        routes: {
          ...initialStoreState.routes,
          previousRoutes: [mockRoute]
        }
      };
      configuredStore = configureStore([thunk]);
    });

    beforeEach(() => {
      // reset store state and clears actions
      store = configuredStore(initialStoreState);
    });

    // if changing this method, change in other tests too
    function mockDispatchAction(state, action, propertyMatcher, test = true) {
      // slightly different implementation in this redux module test.
      const newStore = configuredStore(state);
      newStore.dispatch(action);
      const resolvedActions = newStore.getActions();
      let newState = state.layers;
      // should only be one but the loop is used for future changes and so all tests conform.
      resolvedActions.forEach(resolvedAction => {
        newState = layerReducer(newState, resolvedAction);
      });
      if (test) {
        expect(resolvedActions).toMatchSnapshot();
        expect(newState).toMatchSnapshot(propertyMatcher);
      }

      const returnState = {
        ...state,
        layers: {
          ...newState
        }
      };
      return returnState;
    }

    it('cacheAreaLayer with area', () => {
      store.dispatch(cacheAreaLayer('area', 'areaIDMock', 'layerIDMock'));
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore(populatedStoreState);

      store.dispatch(cacheAreaLayer('area', 'areaIDMock', 'layerIDMock'));
      store.dispatch(cacheAreaLayer('area', 'areaIDMock1', 'layerIDMock1'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('cacheAreaLayer with route', () => {
      store.dispatch(cacheAreaLayer('route', 'routeIDMock', 'layerIDMock'));
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore(populatedStoreState);

      store.dispatch(cacheAreaLayer('route', 'routeIDMock', 'layerIDMock'));
      store.dispatch(cacheAreaLayer('route', 'routeIDMock1', 'layerIDMock1'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('cacheAreaBasemap with area', () => {
      store.dispatch(cacheAreaBasemap('area', 'areaIDMock'));
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore(populatedStoreState);

      store.dispatch(cacheAreaBasemap('area', 'areaIDMock'));
      store.dispatch(cacheAreaBasemap('area', 'areaIDMock1'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('cacheAreaBasemap with route', () => {
      store.dispatch(cacheAreaBasemap('route', 'routeIDMock'));
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore(populatedStoreState);

      store.dispatch(cacheAreaBasemap('route', 'routeIDMock'));
      store.dispatch(cacheAreaBasemap('route', 'routeIDMock1'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('cacheLayers with area', () => {
      store.dispatch(cacheLayers('area'));
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore(populatedStoreState);

      store.dispatch(cacheLayers('area'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('cacheLayers with route', () => {
      store.dispatch(cacheLayers('route'));
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore(populatedStoreState);

      store.dispatch(cacheLayers('route'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('downloadAreaById', () => {
      store.dispatch(downloadAreaById('areaIDMock'));
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore(populatedStoreState);

      store.dispatch(downloadAreaById('areaIDMock'));
      store.dispatch(downloadAreaById('areaIDMock1'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('downloadRouteById', () => {
      store.dispatch(downloadAreaById('routeIDMock'));
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore(populatedStoreState);

      store.dispatch(downloadAreaById('routeIDMock'));
      store.dispatch(downloadAreaById('routeIDMock1'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('getUserLayers', () => {
      store.dispatch(getUserLayers());
      expect(store.getActions()).toMatchSnapshot();
    });

    it('refreshCacheById for area', () => {
      store.dispatch(refreshCacheById('areaIDMock', 'area'));
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore(populatedStoreState);

      store.dispatch(refreshCacheById('areaIDMock', 'area'));
      store.dispatch(refreshCacheById('areaIDMock1', 'area'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('refreshCacheById for route', () => {
      store.dispatch(refreshCacheById('routeIDMock', 'route'));
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore(populatedStoreState);

      store.dispatch(refreshCacheById('routeIDMock', 'route'));
      store.dispatch(refreshCacheById('routeIDMock1', 'route'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('resetCacheStatus', () => {
      store.dispatch(resetCacheStatus('areaIDMock'));
      store.dispatch(resetCacheStatus('areaIDMock1'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('resetCacheStatus full test', () => {
      const propertyMatcher = { syncDate: expect.any(Number) };
      let newState = {
        layers: layerReducer(undefined, { type: 'NONE' }),
        areas: {
          ...initialStoreState.areas,
          data: [mockArea]
        }
      };

      newState = mockDispatchAction(newState, resetCacheStatus('areaIDMock'), propertyMatcher);
      newState = mockDispatchAction(newState, downloadAreaById('areaIDMock'), propertyMatcher);
      mockDispatchAction(newState, resetCacheStatus('areaIDMock2'), propertyMatcher);
    });

    it('syncLayers', () => {
      store.dispatch(syncLayers());
      expect(store.getActions()).toMatchSnapshot();

      store = configuredStore({
        ...initialStoreState,
        layers: {
          ...initialStoreState.layers,
          synced: true
        }
      });

      store.dispatch(syncLayers());
      expect(store.getActions()).toMatchSnapshot();
    });
  });
});
