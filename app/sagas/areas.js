// @flow

import { put, takeEvery } from 'redux-saga/effects';
import { initSetup } from 'redux-modules/setup';
import { SAVE_AREA_REQUEST } from 'redux-modules/areas';

export function* resetSetupOnAreaCreation(): Generator<*, *, *> {
  function* resetSetup(): Generator<*, *, *> {
    yield put(initSetup());
  }

  yield takeEvery(SAVE_AREA_REQUEST, resetSetup);
}
