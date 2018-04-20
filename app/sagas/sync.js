import { put, takeEvery } from 'redux-saga/effects';
import { syncAlerts } from 'redux-modules/alerts';
import { GET_AREAS_COMMIT } from 'redux-modules/areas';


// Our worker Saga: will perform the async increment task
export function* syncAlertSaga() {
  yield put(syncAlerts());
}

// Our watcher Saga: spawn a new syncAlertSaga task on each INCREMENT_ASYNC
export function* getAlertsOnAreasCommit() {
  yield takeEvery(GET_AREAS_COMMIT, syncAlertSaga);
}
