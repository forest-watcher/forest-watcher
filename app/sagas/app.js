// @flow
import { takeEvery, put, select } from 'redux-saga/effects';
import { saveLastActions, SAVE_LAST_ACTIONS, UPDATE_APP } from 'redux-modules/app';
import { getUserLayers } from 'redux-modules/layers';
import { getAreas } from 'redux-modules/areas';

export function* logLastActions(): Generator<*, *, *> {
  yield takeEvery('*', function* logger(action) {
    const log = action.type !== SAVE_LAST_ACTIONS && !action.type.startsWith('user/');
    if (log) {
      yield put(saveLastActions(action));
    }
  });
}

export function* updateApp(): Generator<*, *, *> {
  function* fetchAreasAndAlerts() {
    const { loggedIn } = yield select(state => state.user);
    if (loggedIn) {
      yield put(getAreas());
      yield put(getUserLayers());
    }
  }
  yield takeEvery(UPDATE_APP, fetchAreasAndAlerts);
}
