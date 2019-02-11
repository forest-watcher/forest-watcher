import 'react-native';
import appReducer, { setAppSynced, setOfflineMode, syncApp } from 'redux-modules/app';

// JEST TESTS
describe('Unit Tests', () => {
  it('test runs', () => {
    expect(true);
  });

  it('snapshot runs', () => {
    expect({ hello: true, number: 232 }).toMatchSnapshot();
  });
});

// ACTION TESTS
describe('Redux Actions - Unit Tests', () => {
  it('snapshot redux action test', () => {
    expect(setOfflineMode(true)).toMatchSnapshot();
    expect(setOfflineMode(false)).toMatchSnapshot();
  });

  it('snapshot redux action thunk test', () => {
    expect(syncApp()).toMatchSnapshot(); // thunked action tests don't work currently - no useful output
  });
});

// REDUCER & STATE TESTS
describe('Redux Reducers - Unit Tests', () => {
  it('snapshot redux reducer initial state test', () => {
    expect(appReducer(undefined, { type: 'NONE' })).toMatchSnapshot();
  });

  it('snapshot redux reducer action test', () => {
    expect(appReducer(undefined, setAppSynced(true))).toMatchSnapshot();
  });

  it('snapshot redux reducer multiple action test', () => {
    let state = appReducer(undefined, setAppSynced(true));
    expect(state).toMatchSnapshot();
    state = appReducer(state, setOfflineMode(true));
    expect(state).toMatchSnapshot();
  });
});
