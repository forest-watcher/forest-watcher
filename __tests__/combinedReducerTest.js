import 'react-native';
import { combinedReducer } from 'combinedReducer';
import { retrySync } from 'redux-modules/app';

// TEST

/**
 * We're testing the actions and reducers independently.
 * This let's us test the whole store's state, but at a much lower level
 * and with better insights into how the actions are called/dispatched.
 */
describe('async actions', () => {
  it('Tests redux initial state and handles unknown action', () => {
    expect(combinedReducer(undefined, { type: 'unknownActionTest' })).toMatchSnapshot({
      areas: { syncDate: expect.any(Number) },
      layers: { syncDate: expect.any(Number) }
    });
  });

  it('Test retrySync on initial state', () => {
    expect(combinedReducer(undefined, retrySync())).toMatchSnapshot({
      areas: { syncDate: expect.any(Number) },
      layers: { syncDate: expect.any(Number) }
    });
  });
});

// MOCKS
/* eslint-disable */
jest.mock('react-native-config', () => ({ API_URL: '', MAPBOX_TOKEN: '' }));
jest.mock('react-native-cookies', () => { clearAll: jest.fn(); });
jest.mock('react-native-fetch-blob', () => { config: jest.fn(); });
jest.mock('react-native-zip-archive', () => { unzip: jest.fn(); });
jest.mock('Dimensions');
