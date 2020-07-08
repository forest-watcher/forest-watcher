import { all, fork } from 'redux-saga/effects';
import { updateApp } from './app';
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

export function* rootSaga() {
  yield all(sagas.map(saga => fork(saga)));
}
