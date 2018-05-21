// @flow
import type { State } from 'types/store.types';
import i18n from 'locales';

import { UPLOAD_REPORT_COMMIT, UPLOAD_REPORT_ROLLBACK } from 'redux-modules/reports';
import { SAVE_AREA_ROLLBACK } from 'redux-modules/areas';
import { GET_ALERTS_COMMIT } from 'redux-modules/alerts';

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
  }
};
