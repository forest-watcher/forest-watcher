// @flow
import type { State } from 'types/store.types';

import { UPLOAD_REPORT_COMMIT, UPLOAD_REPORT_ROLLBACK } from 'redux-modules/reports';
import { SAVE_AREA_ROLLBACK } from 'redux-modules/areas';
import { GET_ALERTS_COMMIT } from 'redux-modules/alerts';

export default {
  [UPLOAD_REPORT_COMMIT]: {
    type: 'success',
    text: 'sync.reportUploaded'
  },
  [UPLOAD_REPORT_ROLLBACK]: {
    type: 'error',
    text: 'sync.reportUploadRollback'
  },
  [SAVE_AREA_ROLLBACK]: {
    type: 'error',
    text: 'sync.errorCreatingArea',
    time: 15
  },
  [GET_ALERTS_COMMIT]: {
    type: 'success',
    text: 'sync.alertsUpdated',
    check: (state: State) => (state.areas.synced && state.layers.synced && state.alerts.queue.length === 0)
  }
};
