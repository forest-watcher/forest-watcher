import { all, fork } from 'redux-saga/effects';
import { getAlertsOnAreasCommit, getAlertsOnAreaCreation, setActiveAlerts } from './alerts';
import { logLastActions } from './app';

const sagas = [
  logLastActions,
  setActiveAlerts,
  getAlertsOnAreasCommit,
  getAlertsOnAreaCreation
];

export function* rootSaga() {
  yield all(sagas.map(saga => fork(saga)));
}
