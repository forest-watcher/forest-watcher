// @flow
import type { AlertsState, AlertsAction } from 'types/alerts.types';
import type { Dispatch, GetState } from 'types/store.types';
import type { Area } from 'types/areas.types';

import Config from 'react-native-config';
import moment from 'moment';
import memoize from 'lodash/memoize';
import { pointsToGeoJSON } from 'helpers/map';
import { initDb, read } from 'helpers/database';
import { activeDataset } from 'helpers/area';
import CONSTANTS from 'config/constants';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { UPLOAD_REPORT_REQUEST } from 'redux-modules/reports';
import { RETRY_SYNC } from 'redux-modules/app';

const d3Dsv = require('d3-dsv');

const SET_CAN_DISPLAY_ALERTS = 'alerts/SET_CAN_DISPLAY_ALERTS';
const SET_ACTIVE_ALERTS = 'alerts/SET_ACTIVE_ALERTS';
const GET_ALERTS_REQUEST = 'alerts/GET_ALERTS_REQUEST';
export const GET_ALERTS_COMMIT = 'alerts/GET_ALERTS_COMMIT';
const GET_ALERTS_ROLLBACK = 'alerts/GET_ALERTS_ROLLBACK';

const supercluster = require('supercluster');

// TODO: refactor activeCluster into a helper class
function createCluster(data) {
  const cluster = supercluster({
    radius: 120,
    maxZoom: 15, // Default: 16,
    nodeSize: 128
  });
  cluster.load(data.features);
  return cluster;
}

export const activeCluster = {
  supercluster: null
};

function mapAreaToClusters(areaId, datasetSlug, startDate) {
  const realm = initDb();
  // TODO: use days in both systems
  const timeFrame = datasetSlug === CONSTANTS.datasets.VIIRS ? 'day' : 'month';
  const limitRange = moment().subtract(startDate, timeFrame).valueOf();
  const alerts = read(realm, 'Alert')
    .filtered(`areaId = '${areaId}' AND slug = '${datasetSlug}' AND date > '${limitRange}'`);
  const activeAlerts = pointsToGeoJSON(alerts);
  return createCluster(activeAlerts);
}

memoize.Cache = Map;
const memoizedAreaToClusters = memoize(mapAreaToClusters, (...rest) => rest.join('_'));

// Reducer
const initialState = {
  cache: {},
  reported: [],
  canDisplayAlerts: true,
  clusters: null,
  syncError: false,
  queue: []
};

export default function reducer(state: AlertsState = initialState, action: AlertsAction) {
  switch (action.type) {
    case 'app/START_APP': {
      return { ...state, syncError: false, pendingData: {}, clusters: null };
    }
    case RETRY_SYNC: {
      return { ...state, syncError: false };
    }
    case SET_CAN_DISPLAY_ALERTS:
      return { ...state, canDisplayAlerts: action.payload };
    case SET_ACTIVE_ALERTS:
      return { ...state, clusters: action.payload };
    case UPLOAD_REPORT_REQUEST: {
      const { alerts } = action.payload;
      let reported = [...state.reported];

      if (alerts && alerts.length) {
        alerts.forEach((alert) => {
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
      memoizedAreaToClusters.cache.clear();
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
      const daysFromRange = CONSTANTS.areas.alertRange[slug] - range > 0
        ? CONSTANTS.areas.alertRange[slug] - range
        : range; // just in case we are more outdated than a year
      const oldAlertsRange = moment().subtract(daysFromRange, 'days').valueOf();
      const existingAlerts = read(realm, 'Alert')
        .filtered(`areaId = '${areaId}' AND slug = '${slug}' AND date < '${oldAlertsRange}'`);
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
      alertsArray.forEach((alert) => {
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
  return (dispatch: Dispatch, state: GetState) => {
    const areas = state().areas;
    const index = areas.selectedIndex;
    const area = areas.data[index] || null;
    const dataset = activeDataset(area);
    const canDisplay = state().alerts.canDisplayAlerts;

    const action = ({ type: SET_ACTIVE_ALERTS, payload: null }: { type: string, payload: ?string });
    if (dataset && canDisplay) {
      activeCluster.supercluster = memoizedAreaToClusters(area.id, dataset.slug, dataset.startDate);
      action.payload = `${area.id}_${dataset.slug}_${dataset.startDate}`;
      if (memoizedAreaToClusters.cache.size > 3) {
        const first = memoizedAreaToClusters.cache.keys().next().value;
        memoizedAreaToClusters.cache.delete(first);
      }
    }
    dispatch(action);
  };
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

