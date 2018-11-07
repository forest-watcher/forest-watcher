import 'react-native';
import React from 'react';
import { setOfflineMode } from '../app/redux-modules/app';

describe('Unit Tests', () => {

  it('test runs', () => {
    expect(true);
  });

  it('snapshot runs', () => {
    expect(false).toMatchSnapshot();
  });

  it('snapshot object test', () => {
    expect({'hello': true, number: 232}).toMatchSnapshot();
  });

  it('snapshot redux action test', () => {
    expect(setOfflineMode(true)).toMatchSnapshot();
    expect(setOfflineMode(false)).toMatchSnapshot();
  });

});

// MOCKS

jest.mock('react-native-config', () => {return {API_URL: '', MAPBOX_TOKEN: ''}});
jest.mock('react-native-cookies', () => {clearAll: jest.fn()});
jest.mock('react-native-fetch-blob', () => {config: jest.fn()});
jest.mock('react-native-zip-archive', () => {unzip: jest.fn()});
jest.mock('Dimensions');
