// @flow
import type { AlertDatasetAPIConfig, AlertsState, AlertsAction } from 'types/alerts.types';
import type { Area } from 'types/areas.types';
import type { PersistRehydrate } from 'types/offline.types';

import Config from 'react-native-config';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { RETRY_SYNC } from 'redux-modules/shared';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';
import storeAlertsFromCSV from 'helpers/alert-store/storeAlertsFromCSV';
import deleteAlerts from 'helpers/alert-store/deleteAlerts';
import { decreaseAppSynced } from './app';

const GET_ALERTS_REQUEST = 'alerts/GET_ALERTS_REQUEST';
const CLEAR_ALERTS_CACHE = 'alerts/CLEAR_ALERTS_CACHE';
export const GET_ALERTS_COMMIT = 'alerts/GET_ALERTS_COMMIT';
export const GET_ALERTS_ROLLBACK = 'alerts/GET_ALERTS_ROLLBACK';

import moment from 'moment';

// Reducer
const initialState = {
  cache: {},
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
    case CLEAR_ALERTS_CACHE: {
      const { area } = action.meta;
      const cache = { ...state.cache };
      Object.entries(cache).forEach(entry => {
        const [key, value] = entry;
        const subCache = { ...value };
        delete subCache[area.id];
        cache[key] = subCache;
      });
      return { ...state, cache };
    }
    case RETRY_SYNC: {
      return { ...state, syncError: false };
    }
    case GET_ALERTS_REQUEST: {
      const queue = [...state.queue, action.payload];
      return { ...state, queue };
    }
    case GET_ALERTS_COMMIT: {
      const { area, confidenceKey, datasetSlug, alertId, minDate, dateKey } = action.meta;
      const cache = {
        ...state.cache,
        [datasetSlug]: {
          ...state.cache[datasetSlug],
          [area.id]: Date.now()
        }
      };
      const queue: Array<string> = state.queue.filter(item => item !== alertId);

      if (action.payload) {
        storeAlertsFromCSV(area.id, datasetSlug, confidenceKey, dateKey, action.payload, minDate);
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
export function getAreaAlerts(area: Area, datasetSlug: string, apiConfig: AlertDatasetAPIConfig, minDate: Date) {
  const { confidenceKey, dateKey, tableName, requiresMaxDate } = apiConfig.query;
  let url = `${Config.DATA_API_URL}/dataset/${apiConfig.datastoreId}/latest/query/csv?geostore_origin=rw&geostore_id=${
    area.geostore.id
  }&sql=select latitude, longitude, ${dateKey}${
    confidenceKey ? ', ' + confidenceKey : ''
  } from ${tableName} where ${dateKey} >= '${moment(minDate).format('YYYY-MM-DD')}'`;
  if (requiresMaxDate) {
    url += ` and ${dateKey} < '${moment().format('YYYY-MM-DD')}'`;
  }
  url += ` ORDER BY ${dateKey} DESC LIMIT 5000`;
  const alertId = `${area.id}_${datasetSlug}`;
  const headers = {
    Origin: 'com.wri.forestwatcher',
    ['x-api-key']: Config.DATA_API_TOKEN,
    'Content-Type': 'text/csv'
  };
  return {
    type: GET_ALERTS_REQUEST,
    payload: alertId,
    meta: {
      offline: {
        effect: { url, deserialize: false, headers },
        commit: {
          type: GET_ALERTS_COMMIT,
          meta: {
            area,
            datasetSlug,
            minDate,
            alertId,
            confidenceKey,
            dateKey,
            then: payload => (dispatch, state) => {
              dispatch(decreaseAppSynced());
            }
          }
        },
        rollback: {
          type: GET_ALERTS_ROLLBACK,
          meta: {
            alertId,
            then: payload => (dispatch, state) => {
              dispatch(decreaseAppSynced());
            }
          }
        }
      }
    }
  };
}

/// Clears alerts area cache timestamp for the given area
/// @param {Object} area - The area to clear for
export function clearAreaAlertsCache(area: Area) {
  return {
    type: CLEAR_ALERTS_CACHE,
    meta: {
      area
    }
  };
}
