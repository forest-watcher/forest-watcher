import { fork } from 'redux-saga/effects';
import { getAlertsOnAreasCommit, getAlertsOnAreaCreation, setActiveAlerts } from './alerts';
import { logLastActions } from './app';

const sagas = [
  logLastActions,
  setActiveAlerts,
  getAlertsOnAreasCommit,
  getAlertsOnAreaCreation
];

export function* rootSaga() {
  yield sagas.map(saga => fork(saga));
}
