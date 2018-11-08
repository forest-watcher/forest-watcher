import 'react-native';
import React from 'react';
import { default as reducer, setOfflineMode, syncApp } from '../app/redux-modules/app';

describe('Unit Tests', () => {

  it('test runs', () => {
    expect(true);
  });

  it('snapshot runs', () => {
    expect({'hello': true, number: 232}).toMatchSnapshot();
  });

  it('snapshot redux action test', () => {
    expect(setOfflineMode(true)).toMatchSnapshot();
    expect(setOfflineMode(false)).toMatchSnapshot();
  });

  it('snapshot redux reducer test', () => {
    expect(reducer(undefined, setOfflineMode(true))).toMatchSnapshot();
  });

  it('snapshot sync app function test', () => {
    expect(syncApp()).toMatchSnapshot();
  });

});

// MOCKS

jest.mock('react-native-config', () => {return {API_URL: '', MAPBOX_TOKEN: ''}});
jest.mock('react-native-cookies', () => {clearAll: jest.fn()});
jest.mock('react-native-fetch-blob', () => {config: jest.fn()});
jest.mock('react-native-zip-archive', () => {unzip: jest.fn()});
jest.mock('Dimensions');
