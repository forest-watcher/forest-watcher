import { all, fork } from 'redux-saga/effects';
import { getAlertsOnAreasCommit, getAlertsOnAreaCreation, setActiveAlerts } from './alerts';
import { logLastActions } from './app';
import { getAlertsOnAreasCommit, getAlertsOnAreaCreation, setActiveAlerts } from './alerts';
import { resetSetupOnAreaCreation } from './areas';

const sagas = [
  logLastActions,
  setActiveAlerts,
  getAlertsOnAreasCommit,
  getAlertsOnAreaCreation,
  reportNotifications,
  resetSetupOnAreaCreation
];

export function* rootSaga() {
  yield all(sagas.map(saga => fork(saga)));
}
