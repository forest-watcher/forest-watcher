// @flow
import { takeEvery, put, select } from 'redux-saga/effects';
import { UPDATE_APP } from 'redux-modules/app';
import { getUserLayers } from 'redux-modules/layers';
import { getAreas } from 'redux-modules/areas';
import { getUser } from 'redux-modules/user';
import { getDefaultReport } from 'redux-modules/reports';
import { getTeams } from 'redux-modules/teams';
import { setAppSyncing } from '../redux-modules/app';
import jwt_decode from 'jwt-decode';

export function* updateApp(): Generator<*, *, *> {
  function* fetchAreasAndAlerts() {
    const user = yield select(state => state.user);
    let userId = user.userId;
    const loggedIn = user.loggedIn;
    /* For migration - previous versions didn't store the user id */
    if (!userId) {
      const token = user.token;
      const decoded = jwt_decode(token);
      userId = decoded.id;
    }
    if (loggedIn) {
      yield put(setAppSyncing(6));
      yield put(getUser()); // To get possible my GFW changes
      yield put(getTeams(userId));
      yield put(getAreas());
      yield put(getUserLayers());
      yield put(getDefaultReport());
    }
  }
  yield takeEvery(UPDATE_APP, fetchAreasAndAlerts);
}
