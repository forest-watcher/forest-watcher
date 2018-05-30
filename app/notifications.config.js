// @flow
import type { State } from 'types/store.types';
import i18n from 'locales';

import { UPLOAD_REPORT_COMMIT, UPLOAD_REPORT_ROLLBACK } from 'redux-modules/reports';
import { SAVE_AREA_ROLLBACK } from 'redux-modules/areas';
import { GET_ALERTS_COMMIT } from 'redux-modules/alerts';
import { SHOW_CONNECTION_REQUIRED, UPDATE_APP, SHOW_OFFLINE_MODE_IS_ON } from 'redux-modules/app';
import { Types } from 'components/toast-notification';

export default {
  [UPLOAD_REPORT_COMMIT]: {
    type: 'success',
    text: i18n.t('sync.reportUploaded')
  },
  [UPLOAD_REPORT_ROLLBACK]: {
    type: 'error',
    text: i18n.t('sync.reportUploadRollback')
  },
  [SAVE_AREA_ROLLBACK]: {
    type: 'error',
    text: i18n.t('sync.errorCreatingArea'),
    time: 15
  },
  [GET_ALERTS_COMMIT]: {
    type: 'success',
    text: i18n.t('sync.alertsUpdated'),
    check: (state: State) => (state.areas.synced && state.layers.synced && state.alerts.queue.length === 0)
  },
  [SHOW_CONNECTION_REQUIRED]: {
    type: Types.disable,
    text: i18n.t('commonText.connectionRequired')
  },
  [SHOW_OFFLINE_MODE_IS_ON]: {
    type: Types.disable,
    text: i18n.t('commonText.offlineModeIsOn')
  },
  [UPDATE_APP]: {
    text: i18n.t('sync.gettingLatestAlerts')
  }
};
