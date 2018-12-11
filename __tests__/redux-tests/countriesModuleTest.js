import 'react-native';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { combinedReducer } from 'combinedReducer';
import countriesReducer, {
  syncCountries
} from 'redux-modules/countries';

describe('Redux Countries Module', () => {
  it('Initial reducer state', () => {
    expect(countriesReducer(undefined, { type: 'NONE' })).toMatchSnapshot();
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

    function mockDispatchAction(state, action, test = true) {
      const newStore = configuredStore({ countries: state });
      newStore.dispatch(action);
      const resolvedActions = newStore.getActions();
      let newState = state;
      // should only be one but the loop is used for future changes and so all tests conform.
      resolvedActions.forEach(resolvedAction => {
        newState = countriesReducer(newState, resolvedAction); // todo should pass reducer in?
      }); // todo: how one thunk calling another is handled
      if (test) {
        expect(resolvedActions).toMatchSnapshot();
        expect(newState).toMatchSnapshot();
      }
      return newState;
    }

    it('syncCountries', () => {
      store.dispatch(syncCountries());
      expect(store.getActions()).toMatchSnapshot();
    });

    it('syncCountries full test', () => {
      const newState = countriesReducer(undefined, { type: 'NONE' });
      newState.synced = false;
      newState.syncing = false;
      mockDispatchAction(newState, syncCountries());
      newState.synced = true;
      newState.syncing = false;
      mockDispatchAction(newState, syncCountries());
      newState.synced = false;
      newState.syncing = true;
      mockDispatchAction(newState, syncCountries());
      newState.synced = true;
      newState.syncing = true;
      mockDispatchAction(newState, syncCountries());
    });
  });
});
