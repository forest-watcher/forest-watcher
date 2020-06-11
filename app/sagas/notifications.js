// @flow
import { takeEvery, select } from 'redux-saga/effects';
import notifications from 'notifications.config';
import { showNotification } from 'components/toast-notification';
import i18n from 'i18next';

export function* reportNotifications(): Generator<*, *, *> {
  function* sendNotification(action): Generator<*, *, *> {
    const state = yield select();
    // we don't have to check whether notifications[action.type] is defined because action
    // already depends on Object.keys(notifications)
    const { check, textKey, descriptionFn, ...notification } = notifications[action.type];
    if ((typeof check === 'function' && check(state)) || typeof check === 'undefined') {
      const description = descriptionFn ? descriptionFn(action) : null;
      showNotification({ ...notification, text: i18n.t(textKey), description });
    }
  }
  yield takeEvery(Object.keys(notifications), sendNotification);
}
