// @flow
import { takeEvery } from 'redux-saga/effects';
import { SAVE_AREA_ROLLBACK } from 'redux-modules/areas';
import { UPLOAD_REPORT_COMMIT, UPLOAD_REPORT_ROLLBACK } from 'redux-modules/reports';
import { Types, showNotification } from 'components/toast-notification';
import I18n from 'locales';

export function* reportNotifications(): Generator<*, *, *> {
  function sendNotification(action) {
    const notification = {};
    switch (action.type) {
      case UPLOAD_REPORT_COMMIT:
        notification.type = Types.success;
        notification.text = I18n.t('sync.reportUploaded');
        break;
      case UPLOAD_REPORT_ROLLBACK:
        notification.type = Types.error;
        notification.text = I18n.t('sync.reportUploadRollback');
        break;
      case SAVE_AREA_ROLLBACK:
        notification.type = Types.error;
        notification.text = I18n.t('sync.errorCreatingArea');
        notification.time = 15;
        break;

      default:
        break;
    }
    showNotification(notification);
  }
  const actionsToNotify = [UPLOAD_REPORT_COMMIT, UPLOAD_REPORT_ROLLBACK, SAVE_AREA_ROLLBACK];
  yield takeEvery(actionsToNotify, sendNotification);
}
