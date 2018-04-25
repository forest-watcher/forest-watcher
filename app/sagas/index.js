import { fork } from 'redux-saga/effects';
import { getAlertsOnAreasCommit, setActiveAlerts } from './alerts';
import { logLastActions } from './app';

const sagas = [
  logLastActions,
  setActiveAlerts,
  getAlertsOnAreasCommit
];

export function* rootSaga() {
  yield sagas.map(saga => fork(saga));
}
