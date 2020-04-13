// @flow
import type { OfflineMeta, PersistRehydrate } from 'types/offline.types';
import type { Area } from 'types/areas.types';
import type { LogoutRequest } from 'types/user.types';
import type { RetrySync } from 'types/app.types';
import type { UploadReportRequest } from 'types/reports.types';

export type Alert = {
  long: number,
  lat: number,
  date: number
};

export type AlertsState = {
  data: {
    [areaId: string]: {
      viirs: {
        lastUpdated: number,
        alerts: Array<Alert>
      },
      umd_as_it_happens: {
        lastUpdated: number,
        alerts: Array<Alert>
      }
    }
  },
  reported: Array<string>,
  canDisplayAlerts: boolean,
  syncError: boolean,
  queue: Array<string>
};

export type AlertsAction =
  | RetrySync
  | SetActiveAlerts
  | SetCanDisplayAlerts
  | GetAreaAlertsRequest
  | GetAreaAlertsCommit
  | GetAreaAlertsRollback
  | UploadReportRequest
  | PersistRehydrate
  | LogoutRequest;

type SetActiveAlerts = { type: 'alerts/SET_ACTIVE_ALERTS' };
type SetCanDisplayAlerts = { type: 'alerts/SET_CAN_DISPLAY_ALERTS', payload: boolean };
type GetAreaAlertsRequest = {
  type: 'alerts/GET_ALERTS_REQUEST',
  payload: string,
  meta: OfflineMeta
};
export type GetAreaAlertsCommit = {
  type: 'alerts/GET_ALERTS_COMMIT',
  payload: ?string,
  meta: { area: Area, datasetSlug: string, range: number, alertId: string }
};
type GetAreaAlertsRollback = {
  type: 'alerts/GET_ALERTS_ROLLBACK',
  payload: ?string,
  meta: { alertId: string }
};
