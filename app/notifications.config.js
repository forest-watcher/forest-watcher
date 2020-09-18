// @flow
import type { State } from 'types/store.types';
import type { SharingBundleImported } from 'types/app.types';

import { UPLOAD_REPORT_COMMIT, UPLOAD_REPORT_ROLLBACK } from 'redux-modules/reports';
import { SAVE_AREA_ROLLBACK } from 'redux-modules/areas';
import { GET_ALERTS_COMMIT, GET_ALERTS_ROLLBACK } from 'redux-modules/alerts';
import {
  SHOW_CONNECTION_REQUIRED,
  UPDATE_APP,
  SHOW_OFFLINE_MODE_IS_ON,
  EXPORT_REPORTS_SUCCESSFUL,
  SHARING_BUNDLE_IMPORTED
} from 'redux-modules/app';
import { Types } from 'components/toast-notification';
import i18n from 'i18next';

export default {
  [UPLOAD_REPORT_COMMIT]: {
    type: Types.success,
    textKey: 'sync.reportUploaded'
  },
  [UPLOAD_REPORT_ROLLBACK]: {
    type: Types.error,
    textKey: 'sync.reportUploadRollback'
  },
  [SAVE_AREA_ROLLBACK]: {
    type: Types.error,
    textKey: 'sync.errorCreatingArea',
    time: 15
  },
  [GET_ALERTS_COMMIT]: {
    type: Types.success,
    textKey: 'sync.alertsUpdated',
    check: (state: State) => state.areas.synced && state.layers.synced && state.alerts.queue.length === 0
  },
  [GET_ALERTS_ROLLBACK]: {
    type: Types.error,
    textKey: 'sync.failed.title'
  },
  [SHOW_CONNECTION_REQUIRED]: {
    type: Types.error,
    textKey: 'commonText.connectionRequired'
  },
  [SHOW_OFFLINE_MODE_IS_ON]: {
    type: Types.disable,
    textKey: 'commonText.offlineModeIsOn'
  },
  [UPDATE_APP]: {
    textKey: 'sync.gettingLatestAlerts'
  },
  [EXPORT_REPORTS_SUCCESSFUL]: {
    type: Types.success,
    textKey: 'report.export.successful'
  },
  [SHARING_BUNDLE_IMPORTED]: {
    type: Types.success,
    textKey: 'importBundle.success',
    time: 5,
    descriptionFn: (action: SharingBundleImported) =>
      `${action.payload.summary} ${i18n.t('importBundle.successContentsSuffix')}`
  }
};
