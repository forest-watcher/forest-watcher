import 'react-native';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { combinedReducer } from 'combinedReducer';
import areasReducer, {
  deleteArea,
  getAreas,
  saveArea,
  setAreasRefreshing,
  syncAreas,
  updateArea
} from 'redux-modules/areas';

describe('Redux Areas Module', () => {
  it('Initial reducer state', () => {
    expect(areasReducer(undefined, { type: 'NONE' })).toMatchSnapshot({ syncDate: expect.any(Number) });
  });

  describe('Simple Actions: snapshot and reducer test', () => {
    // Snapshot tests the action object and the reducer state
    function simpleActionTest(action) {
      expect(action).toMatchSnapshot();
      expect(areasReducer(undefined, action)).toMatchSnapshot({ syncDate: expect.any(Number) });
    }

    it('saveLastActions', () => {
      simpleActionTest(getAreas());
    });

    it('setAreasRefreshing', () => {
      simpleActionTest(setAreasRefreshing(true));
      simpleActionTest(setAreasRefreshing(false));
    });

    it('saveArea', () => {
      const mockParams = { area: { name: 'nameMock' }, snapshot: 'snapshotMock' };
      simpleActionTest(saveArea(mockParams));
      mockParams.area.geojson = 'geojsonMock';
      mockParams.datasets = { datasetMock: 'mockData' };
      simpleActionTest(saveArea(mockParams));
    });
  });

  describe('Redux Snapshot Thunk Actions', () => {
    let initialStoreState;
    let configuredStore;
    let store;

    beforeAll(() => {
      // create store
      initialStoreState = combinedReducer(undefined, { type: 'NONE' });
      // initialStoreState = { app: areasReducer(undefined, { type: 'NONE' }) };
      configuredStore = configureStore([thunk]);
    });

    beforeEach(() => {
      // reset store state and clears actions
      store = configuredStore(initialStoreState);
    });

    function mockDispatchAction(state, action, test = true) {
      const newStore = configuredStore({ app: state });
      newStore.dispatch(action);
      const resolvedActions = newStore.getActions();
      let newState = state;
      resolvedActions.forEach(resolvedAction => {
        newState = areasReducer(newState, resolvedAction);
      });
      if (test) {
        expect(resolvedActions).toMatchSnapshot();
        expect(newState).toMatchSnapshot();
      }
      return newState;
    }

    it('updateArea', () => {
      // todo add mock area in state for UPDATE_AREA_ROLLBACK
      store.dispatch(updateArea({ id: 'IDMock' }));
      expect(store.getActions()).toMatchSnapshot();
      store.clearActions();
      const mockArea = {
        name: 'nameMock',
        id: 'IDMock',
        application: 'applicationMock', // used to test that all fields are included in payload
        datasets: { datasetMock: 'mockData' }
      };
      store.dispatch(updateArea(mockArea));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('deleteArea with area', () => {
      const mockArea1 = { name: 'nameMock', id: 'areaIDMock1' };
      const mockArea2 = { name: 'nameMock', id: 'areaIDMock2' };
      store = configuredStore({ ...initialStoreState, areas: { data: [mockArea1, mockArea2] } });
      store.dispatch(deleteArea('areaIDMock1'));
      expect(store.getActions()).toMatchSnapshot();
    });

    it('syncAreas', () => {
      const mockState = { user: { loggedIn: true }, areas: { synced: false, syncing: false } };
      store = configuredStore({ ...initialStoreState, ...mockState });
      store.dispatch(syncAreas());
      expect(store.getActions()).toMatchSnapshot();
    });

    // it('showNotConnectedNotification full test', () => {
    //   // TODO FLOW: add area, update, delete
    //   let newState = areasReducer(undefined, { type: 'NONE' });
    //   // todo: can for loop actions:
    //   newState = mockDispatchAction(newState, showNotConnectedNotification());
    //   newState = mockDispatchAction(newState, setOfflineMode(true));
    //   mockDispatchAction(newState, showNotConnectedNotification());
    // });
  });
});

global.FormData = function FormDataMock() {
  this.append = jest.fn();
};
