// @flow
import type { OfflineMeta, PersistRehydrate } from 'types/offline.types';
import type { Area } from 'types/areas.types';
import type { LogoutRequest } from 'types/user.types';
import type { RetrySync } from 'types/app.types';
import type { UploadReportRequest } from 'types/reports.types';

export type Alert = {
  id?: string,
  areaId: string,
  slug: string,
  long: number,
  lat: number,
  date: number,
  confidence?: string
};

export type SelectedAlert = {
  lat: number,
  long: number,
  datasetId: ?string,
  confidence?: string
};

export type FilterThreshold = {
  units: 'days' | 'months' | 'weeks',
  value: number
};

export type AlertDatasetCategory = {
  id: string,
  faqCategory?: string,
  faqQuestionId?: string,
  faqTitleKey?: string,
  nameKey: string,
  filterThresholds: Array<FilterThreshold>,
  iconPrefix: string,
  color: string,
  colorReported: string,
  datasetSlugs: Array<string>
};

export type AlertDatasetAPIConfig = {
  datastoreId: string,
  query: {
    confidenceKey?: string,
    dateKey: string,
    maxDateKey?: string,
    minDateKey: string,
    tableName: string
  }
};

export type AlertDatasetConfig = {
  api: AlertDatasetAPIConfig,
  id: string,
  nameKey: string,
  reportNameId: string,
  requestThreshold: number // days
};

export type AlertsState = {
  cache: {
    viirs?: {
      [areaId: string]: string
    },
    umd_as_it_happens?: {
      [areaId: string]: string
    },
    wur_radd_alerts?: {
      [areaId: string]: string
    },
    glad_sentinel_2?: {
      [areaId: string]: string
    }
  },
  syncError: boolean,
  queue: Array<string>
};

export type AlertsAction =
  | RetrySync
  | GetAreaAlertsRequest
  | GetAreaAlertsCommit
  | GetAreaAlertsRollback
  | UploadReportRequest
  | PersistRehydrate
  | LogoutRequest;

type GetAreaAlertsRequest = {
  type: 'alerts/GET_ALERTS_REQUEST',
  payload: string,
  meta: OfflineMeta
};
export type GetAreaAlertsCommit = {
  type: 'alerts/GET_ALERTS_COMMIT',
  payload: ?string,
  meta: { area: Area, datasetSlug: string, minDate: Date, confidenceKey?: string, dateKey: string, alertId: string }
};
type GetAreaAlertsRollback = {
  type: 'alerts/GET_ALERTS_ROLLBACK',
  payload: ?Error,
  meta: { alertId: string }
};
