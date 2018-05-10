import { all, fork } from 'redux-saga/effects';
import { logLastActions } from './app';
import { getAlertsOnAreasCommit, getAlertsOnAreaCreation, setActiveAlerts } from './alerts';
import { reportNotifications } from './notifications';
import { resetSetupOnAreaCreation } from './areas';

const sagas = [
  setActiveAlerts,
  getAlertsOnAreasCommit,
  getAlertsOnAreaCreation,
  reportNotifications,
  resetSetupOnAreaCreation
];

if (!__DEV__) {
  sagas.push(logLastActions);
}

export function* rootSaga() {
  yield all(sagas.map(saga => fork(saga)));
}
