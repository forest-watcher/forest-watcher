// @flow
import { PermissionsAndroid, Platform } from 'react-native';
const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line

import type { State } from 'types/store.types';

import { STATUS } from 'config/constants/index';

import { version } from 'package.json';

// eslint-disable-next-line import/default
import codePush from 'react-native-code-push';

export function isUnsafeLogout(state: State) {
  const { list } = state.reports;
  const hasReportsToUpload = type => type === STATUS.complete || type === STATUS.draft;
  return Object.values(list)
    .map(report => report.status)
    .some(hasReportsToUpload);
}

export function requestLocationPermissions() {
  if (Platform.OS === 'ios') {
    Location.requestWhenInUseAuthorization();
    return Promise.resolve(true);
  } else if (Platform.OS === 'android') {
    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(
      result => result === true || result === PermissionsAndroid.RESULTS.GRANTED
    );
  }
  return Promise.reject('Unsupported platform');
}

export function shouldBeConnected(state: State) {
  const { offline, app } = state;
  return offline.online && !app.offlineMode;
}

export function getVersionName() {
  return codePush.getUpdateMetadata().then(update => {
    if (update) {
      return `v${version}-codepush_${update.label}`;
    }
    return `v${version}`;
  });
}
