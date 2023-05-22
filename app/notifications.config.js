// @flow
import type { SharingBundleImported } from 'types/app.types';

import { UPLOAD_REPORT_COMMIT, UPLOAD_REPORT_ROLLBACK } from 'redux-modules/reports';
import { SAVE_AREA_ROLLBACK } from 'redux-modules/areas';
import { GET_ALERTS_ROLLBACK } from 'redux-modules/alerts';
import {
  SHOW_CONNECTION_REQUIRED,
  UPDATE_APP,
  SHOW_OFFLINE_MODE_IS_ON,
  EXPORT_REPORTS_SUCCESSFUL,
  SHARING_BUNDLE_IMPORTED
} from 'redux-modules/app';
import { Types } from 'components/toast-notification';
import i18n from 'i18next';
import { TEAM_ACTION_ACCEPT_COMMIT, TEAM_ACTION_DECLINE_COMMIT, TEAM_ACTION_LEAVE_COMMIT } from './redux-modules/teams';
import { UPLOAD_ROUTE_COMMIT, UPLOAD_ROUTE_ROLLBACK } from 'redux-modules/routes';
import { SYNC_FINISHED } from './redux-modules/app';

export default ({
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
  [SYNC_FINISHED]: {
    type: Types.success,
    textKey: 'sync.complete'
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
  },
  [TEAM_ACTION_ACCEPT_COMMIT]: {
    type: Types.success,
    textKey: 'teams.notifications.acceptSuccess'
  },
  [TEAM_ACTION_LEAVE_COMMIT]: {
    type: Types.success,
    textKey: 'teams.notifications.leaveSuccess'
  },
  [TEAM_ACTION_DECLINE_COMMIT]: {
    type: Types.success,
    textKey: 'teams.notifications.declineSuccess'
  },
  [UPLOAD_ROUTE_COMMIT]: {
    type: Types.success,
    textKey: 'routes.sync.successNotif'
  },
  [UPLOAD_ROUTE_ROLLBACK]: {
    type: Types.error,
    textKey: 'routes.sync.failNotif'
  }
}: any);
