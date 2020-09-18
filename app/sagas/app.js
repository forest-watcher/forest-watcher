// @flow
import { takeEvery, put, select } from 'redux-saga/effects';
import { UPDATE_APP } from 'redux-modules/app';
import { getUserLayers } from 'redux-modules/layers';
import { getAreas } from 'redux-modules/areas';
import { getUser } from 'redux-modules/user';

export function* updateApp(): Generator<*, *, *> {
  function* fetchAreasAndAlerts() {
    const { loggedIn } = yield select(state => state.user);
    if (loggedIn) {
      yield put(getUser()); // To get possible my GFW changes
      yield put(getAreas());
      yield put(getUserLayers());
    }
  }
  yield takeEvery(UPDATE_APP, fetchAreasAndAlerts);
}
