import { all, fork } from 'redux-saga/effects';
import { logLastActions, updateApp } from './app';
import { getAlertsOnAreasCommit, getAlertsOnAreaCreation } from './alerts';
import { reportNotifications } from './notifications';
import { resetSetupOnAreaCreation } from './areas';

const sagas = [
  getAlertsOnAreasCommit,
  getAlertsOnAreaCreation,
  reportNotifications,
  resetSetupOnAreaCreation,
  updateApp
];

if (!__DEV__) {
  sagas.push(logLastActions);
}

export function* rootSaga() {
  yield all(sagas.map(saga => fork(saga)));
}
