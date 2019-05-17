// @flow
import { PermissionsAndroid, Platform } from 'react-native';
import RNLocation from 'react-native-location';

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
