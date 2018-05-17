// @flow
import { takeEvery, put } from 'redux-saga/effects';
import { saveLastActions, SAVE_LAST_ACTIONS } from 'redux-modules/app';

export function* logLastActions(): Generator<*, *, *> {
  yield takeEvery('*', function* logger(action) {
    const log = action.type !== SAVE_LAST_ACTIONS && !action.type.startsWith('user/');
    if (log) {
      yield put(saveLastActions(action));
    }
  });
}
