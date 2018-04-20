// @flow
import type { OfflineMeta } from 'types/offline.types';
import type { Area } from 'types/areas.types';
import type { LogoutRequest } from 'types/user.types';

export type AlertsState = {
  cache: {
    viirs?: {
      [string]: string
    },
    umd_as_it_happens?: {
      [string]: string
    }
  },
  reported: Array<string>,
  canDisplayAlerts: boolean,
  clusters: any,
  syncError: boolean,
  queue: Array<string>
};

export type AlertsAction =
  | SetCanDisplayAlerts
  | GetAreaAlertsRequest
  | GetAreaAlertsCommit
  | GetAreaAlertsRollback
  | LogoutRequest;

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
