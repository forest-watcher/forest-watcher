import 'react-native';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { combinedReducer } from 'combinedReducer';
import reportsReducer, {
  createReport,
  deleteReport,
  getDefaultReport,
  saveReport,
  setReportAnswer,
  syncReports,
  uploadReport
} from 'redux-modules/reports';

describe('Redux Reports Module', () => {
  it('Initial reducer state', () => {
    expect(reportsReducer(undefined, { type: 'NONE' })).toMatchSnapshot();
  });

  describe('Simple Actions: snapshot and reducer test', () => {
    // Snapshot tests the action object and the reducer state
    function simpleActionTest(action) {
      expect(action).toMatchSnapshot();
      expect(reportsReducer(undefined, action)).toMatchSnapshot();
    }

    it('getDefaultReport', () => {
      simpleActionTest(getDefaultReport());
    });
  });

  describe('Redux Snapshot Thunk Actions', () => {
    let initialStoreState;
    let configuredStore;
    let store;

    beforeAll(() => {
      // create store
      initialStoreState = combinedReducer(undefined, { type: 'NONE' });
      // initialStoreState = { app: reportsReducer(undefined, { type: 'NONE' }) };
      configuredStore = configureStore([thunk]);
    });

    beforeEach(() => {
      // reset store state and clears actions
      store = configuredStore(initialStoreState);
    });

    // if changing this method, change in other tests too
    function mockDispatchAction(state, action, test = true) {
      const newStore = configuredStore({ app: state });
      newStore.dispatch(action);
      const resolvedActions = newStore.getActions();
      let newState = state;
      // should only be one but the loop is used for future changes and so all tests conform.
      resolvedActions.forEach(resolvedAction => {
        newState = reportsReducer(newState, resolvedAction);
      });
      if (test) {
        expect(resolvedActions).toMatchSnapshot();
        expect(newState).toMatchSnapshot();
      }
      return newState;
    }
  });
});
