// @flow
import { takeEvery, put } from 'redux-saga/effects';
import { saveLastActions, SAVE_LAST_ACTIONS } from 'redux-modules/app';

declare var __DEV__: boolean;

export function* logLastActions(): Generator<*, *, *> {
  yield takeEvery('*', function* logger(action) {
    const log = action.type !== SAVE_LAST_ACTIONS && !action.type.startsWith('user/');
    if (log && !__DEV__) {
      yield put(saveLastActions(action));
    }
  });
}
