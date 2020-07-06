// @flow
import type { AlertsState, AlertsAction } from 'types/alerts.types';
import type { Area } from 'types/areas.types';
import type { PersistRehydrate } from 'types/offline.types';

import Config from 'react-native-config';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { CREATE_REPORT, RETRY_SYNC } from 'redux-modules/shared';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';
import storeAlertsFromCsv from 'helpers/alert-store/storeAlertsFromCsv';
import deleteAlerts from 'helpers/alert-store/deleteAlerts';

const GET_ALERTS_REQUEST = 'alerts/GET_ALERTS_REQUEST';
export const GET_ALERTS_COMMIT = 'alerts/GET_ALERTS_COMMIT';
const GET_ALERTS_ROLLBACK = 'alerts/GET_ALERTS_ROLLBACK';

// Reducer
const initialState = {
  cache: {},
  reported: [],
  syncError: false,
  queue: []
};

export default function reducer(state: AlertsState = initialState, action: AlertsAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { alerts } = (action: PersistRehydrate).payload;
      return { ...state, ...alerts, syncError: false };
    }
    case RETRY_SYNC: {
      return { ...state, syncError: false };
    }
    case CREATE_REPORT: {
      const { selectedAlerts } = action.payload;
      let reported = [...state.reported];

      if (selectedAlerts?.length) {
        selectedAlerts.forEach(alert => {
          reported = [...reported, `${alert.long}${alert.lat}`];
        }, this);
      }
      return { ...state, reported };
    }
    case GET_ALERTS_REQUEST: {
      const queue = [...state.queue, action.payload];
      return { ...state, queue };
    }
    case GET_ALERTS_COMMIT: {
      const { area, datasetSlug, range, alertId } = action.meta;
      const cache = {
        ...state.cache,
        [datasetSlug]: {
          ...state.cache[datasetSlug],
          [area.id]: Date.now()
        }
      };
      const queue: Array<string> = state.queue.filter(item => item !== alertId);

      if (action.payload) {
        storeAlertsFromCsv(area.id, datasetSlug, action.payload, range);
      }
      return { ...state, queue, cache };
    }
    case GET_ALERTS_ROLLBACK: {
      const { alertId } = action.meta;
      const queue: Array<string> = state.queue.filter(item => item !== alertId);
      return { ...state, queue, syncError: true };
    }
    case LOGOUT_REQUEST: {
      deleteAlerts();
      return initialState;
    }
    default:
      return state;
  }
}

// Action Creators
export function getAreaAlerts(area: Area, datasetSlug: string, range: number) {
  const url = `${Config.API_URL}/fw-alerts/${datasetSlug}/${area.geostore.id}?range=${range}&output=csv`;
  const alertId = `${area.id}_${datasetSlug}`;
  return {
    type: GET_ALERTS_REQUEST,
    payload: alertId,
    meta: {
      offline: {
        effect: { url, deserialize: false },
        commit: { type: GET_ALERTS_COMMIT, meta: { area, datasetSlug, range, alertId } },
        rollback: { type: GET_ALERTS_ROLLBACK, meta: { alertId } }
      }
    }
  };
}
