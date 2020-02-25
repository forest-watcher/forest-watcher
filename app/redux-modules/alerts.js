// @flow
import type { AlertsState, AlertsAction } from 'types/alerts.types';
import type { Area } from 'types/areas.types';

import Config from 'react-native-config';
import moment from 'moment';
import { initDb, read } from 'helpers/database';
import CONSTANTS from 'config/constants';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { UPLOAD_REPORT_REQUEST } from 'redux-modules/reports';
import { RETRY_SYNC } from 'redux-modules/app';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

const d3Dsv = require('d3-dsv');

const SET_CAN_DISPLAY_ALERTS = 'alerts/SET_CAN_DISPLAY_ALERTS';
export const SET_ACTIVE_ALERTS = 'alerts/SET_ACTIVE_ALERTS';
const GET_ALERTS_REQUEST = 'alerts/GET_ALERTS_REQUEST';
export const GET_ALERTS_COMMIT = 'alerts/GET_ALERTS_COMMIT';
const GET_ALERTS_ROLLBACK = 'alerts/GET_ALERTS_ROLLBACK';

// Reducer
const initialState = {
  cache: {},
  reported: [],
  canDisplayAlerts: true,
  syncError: false,
  queue: []
};

export default function reducer(state: AlertsState = initialState, action: AlertsAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      const { alerts } = action.payload;
      return { ...state, ...alerts, syncError: false };
    }
    case RETRY_SYNC: {
      return { ...state, syncError: false };
    }
    case SET_CAN_DISPLAY_ALERTS:
      return { ...state, canDisplayAlerts: action.payload };
    case UPLOAD_REPORT_REQUEST: {
      const { alerts } = action.payload;
      let reported = [...state.reported];

      if (alerts && alerts.length) {
        alerts.forEach(alert => {
          reported = [...reported, `${alert.lon}${alert.lat}`];
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
      const queue = state.queue.filter(item => item !== alertId);
      if (action.payload) {
        saveAlertsToDb(area.id, datasetSlug, action.payload, range);
      }
      return { ...state, queue, cache };
    }
    case GET_ALERTS_ROLLBACK: {
      const { alertId } = action.meta;
      const queue = state.queue.filter(item => item !== alertId);
      return { ...state, queue, syncError: true };
    }
    case LOGOUT_REQUEST: {
      resetAlertsDb();
      return initialState;
    }
    default:
      return state;
  }
}

export function saveAlertsToDb(areaId: string, slug: string, alerts: string, range: number) {
  if (alerts && alerts.length > 0) {
    const realm = initDb();
    if (range) {
      const daysFromRange =
        CONSTANTS.areas.alertRange[slug] - range > 0 ? CONSTANTS.areas.alertRange[slug] - range : range; // just in case we are more outdated than a year
      const oldAlertsRange = moment()
        .subtract(daysFromRange, 'days')
        .valueOf();
      const existingAlerts = read(realm, 'Alert').filtered(
        `areaId = '${areaId}' AND slug = '${slug}' AND date < '${oldAlertsRange}'`
      );
      if (existingAlerts.length > 0) {
        try {
          realm.write(() => {
            realm.delete(existingAlerts);
          });
        } catch (e) {
          console.warn('Error cleaning db', e);
        }
      }
    }
    const alertsArray = d3Dsv.csvParse(alerts);
    realm.write(() => {
      alertsArray.forEach(alert => {
        realm.create('Alert', {
          slug,
          areaId,
          date: parseInt(alert.date, 10),
          lat: parseFloat(alert.lat),
          long: parseFloat(alert.lon)
        });
      });
    });
  }
}

export function resetAlertsDb() {
  const realm = initDb();
  realm.write(() => {
    const allAlerts = realm.objects('Alert');
    realm.delete(allAlerts);
  });
}

// Action Creators
export function setCanDisplayAlerts(canDisplay: boolean) {
  return {
    type: SET_CAN_DISPLAY_ALERTS,
    payload: canDisplay
  };
}

export function setActiveAlerts() {
  return { type: SET_ACTIVE_ALERTS };
}

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
