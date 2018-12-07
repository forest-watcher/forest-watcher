import * as reducers from 'redux-modules';
import { combineReducers } from 'redux';

/**
 * Separated so we can test the store state without having to mock loads of dependencies.
 */
export const combinedReducer = combineReducers(reducers);
