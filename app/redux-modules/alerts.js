import moment from 'moment';
import memoize from 'lodash/memoize';
import { pointsToGeoJSON } from 'helpers/map';
import { initDb, read } from 'helpers/database';
import { activeDataset } from 'helpers/area';
import CONSTANTS from 'config/constants';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { UPLOAD_REPORT_COMMIT } from 'redux-modules/reports';

const SET_CAN_DISPLAY_ALERTS = 'alerts/SET_CAN_DISPLAY_ALERTS';
const SET_ACTIVE_ALERTS = 'alerts/SET_ACTIVE_ALERTS';


// Helpers
function setReportedAlerts(alerts) {
  if (alerts && alerts.length > 0) {
    const realm = initDb();
    alerts.forEach((alert) => {
      const dbAlert = read(realm, 'Alert')
        .filtered(`lat = '${alert.lat}' AND lng = '${alert.lon}`);

      if (dbAlert) {
        realm.write(() => {
          dbAlert.reported = true;
        });
      }
    }, this);
  }
}

const supercluster = require('supercluster');

// TODO: refactor activeCluster into a helper class
function createCluster(data) {
  const cluster = supercluster({
    radius: 120,
    maxZoom: 16, // Default: 16,
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
  data: {},
  canDisplayAlerts: true,
  clusters: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_CAN_DISPLAY_ALERTS:
      return { ...state, canDisplayAlerts: action.payload };
    case SET_ACTIVE_ALERTS:
      return { ...state, clusters: action.payload };
    case UPLOAD_REPORT_COMMIT: {
      const reportedAlerts = action.payload.alerts;
      if (reportedAlerts) {
        setReportedAlerts(reportedAlerts);
      }
      return state;
    }
    case LOGOUT_REQUEST:
      return initialState;
    default:
      return state;
  }
}

// Action Creators
export function setCanDisplayAlerts(canDisplay) {
  return {
    type: SET_CAN_DISPLAY_ALERTS,
    payload: canDisplay
  };
}

export function setActiveAlerts() {
  return (dispatch, state) => {
    const areas = state().areas;
    const index = areas.selectedIndex;
    const area = areas.data[index] || null;
    const dataset = activeDataset(area);
    const datasetSlug = dataset.slug;
    const canDisplay = state().alerts.canDisplayAlerts;

    const action = { type: SET_ACTIVE_ALERTS, payload: null };
    if (datasetSlug && canDisplay) {
      activeCluster.supercluster = memoizedAreaToClusters(area.id, datasetSlug, dataset.startDate);
      action.payload = `${area.id}_${datasetSlug}_${dataset.startDate}`;
      if (memoizedAreaToClusters.cache.size > 3) {
        const first = memoizedAreaToClusters.cache.keys().next().value;
        memoizedAreaToClusters.cache.delete(first);
      }
    }
    dispatch(action);
  };
}
