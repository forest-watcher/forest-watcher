// @flow
import { takeEvery, select } from 'redux-saga/effects';
import notifications from 'notifications.config';
import { showNotification } from 'components/toast-notification';

export function* reportNotifications(): Generator<*, *, *> {
  function* sendNotification(action) {
    const state = yield select();
    // we don't have to check whether notifications[action.type] is defined because action
    // already depends on Object.keys(notifications)
    const { check, text, ...notification } = notifications[action.type];
    if ((typeof check === 'function' && check(state)) || typeof check === 'undefined') {
      showNotification({ ...notification, text });
    }
  }
  yield takeEvery(Object.keys(notifications), sendNotification);
}
