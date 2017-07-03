import Config from 'react-native-config';
import omit from 'lodash/omit';
import { getGeostore, GET_GEOSTORE_REQUEST, GET_GEOSTORE_COMMIT } from 'redux-modules/geostore';
import { getCachedImageByUrl, removeFolder } from 'helpers/fileManagement';
import { getActionsTodoCount } from 'helpers/sync';
import { getInitialDatasets } from 'helpers/area';
import CONSTANTS from 'config/constants';
import { initDb } from 'helpers/database';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';

const d3Dsv = require('d3-dsv');

const GET_AREAS_REQUEST = 'areas/GET_AREAS_REQUEST';
const GET_AREAS_COMMIT = 'areas/GET_AREAS_COMMIT';
const GET_AREAS_ROLLBACK = 'areas/GET_AREAS_ROLLBACK';
const GET_ALERTS_REQUEST = 'areas/GET_ALERTS_REQUEST';
const GET_ALERTS_COMMIT = 'areas/GET_ALERTS_COMMIT';
const GET_ALERTS_ROLLBACK = 'areas/GET_ALERTS_ROLLBACK';
export const SAVE_AREA_REQUEST = 'areas/SAVE_AREA_REQUEST';
export const SAVE_AREA_COMMIT = 'areas/SAVE_AREA_COMMIT';
export const SAVE_AREA_ROLLBACK = 'areas/SAVE_AREA_ROLLBACK';
const GET_AREA_COVERAGE_REQUEST = 'areas/GET_AREA_COVERAGE_REQUEST';
const GET_AREA_COVERAGE_COMMIT = 'areas/GET_AREA_COVERAGE_COMMIT';
const GET_AREA_COVERAGE_ROLLBACK = 'areas/GET_AREA_COVERAGE_ROLLBACK';
export const UPDATE_AREA_REQUEST = 'areas/UPDATE_AREA_REQUEST';
const UPDATE_AREA_COMMIT = 'areas/UPDATE_AREA_COMMIT';
const UPDATE_AREA_ROLLBACK = 'areas/UPDATE_AREA_ROLLBACK';
const REMOVE_CACHE_AREA_REQUEST = 'areas/REMOVE_CACHE_AREA_REQUEST';
const REMOVE_CACHE_AREA_COMMIT = 'areas/REMOVE_CACHE_AREA_COMMIT';
const REMOVE_CACHE_AREA_ROLLBACK = 'areas/REMOVE_CACHE_AREA_ROLLBACK';
const DELETE_AREA_REQUEST = 'areas/DELETE_AREA_REQUEST';
const DELETE_AREA_COMMIT = 'areas/DELETE_AREA_COMMIT';
const DELETE_AREA_ROLLBACK = 'areas/DELETE_AREA_ROLLBACK';
const SET_AREA_IMAGE_REQUEST = 'areas/SET_AREA_IMAGE_REQUEST';
const SET_AREA_IMAGE_COMMIT = 'areas/SET_AREA_IMAGE_COMMIT';
const UPDATE_INDEX = 'areas/UPDATE_INDEX';

// Helpers
function getAreaById(areas, areaId) {
  // Using deconstructor to generate a new object
  return { ...areas.find((areaData) => (areaData.id === areaId)) };
}

function updatedCacheDatasets(datasets, datasetSlug, status) {
  if (!datasets) return [];
  return datasets.map((dataset) => {
    if (dataset.slug === datasetSlug) {
      return { ...dataset, cache: status };
    }
    return dataset;
  });
}

function getUpdatedAreas(areas, newArea) {
  return areas.map((area) => {
    if (area.id === newArea.id) {
      return newArea;
    }
    return area;
  });
}

// Reducer
const initialState = {
  data: [],
  selectedIndex: 0,
  images: {},
  synced: false,
  syncing: false,
  pendingData: {
    coverage: {},
    geostore: {},
    image: {},
    alert: {}
  }
};

export function saveAlertsToDb(areaId, slug, alerts) {
  if (alerts && alerts.length > 0) {
    const realm = initDb();
    const existingAlerts = realm.objects('Alert').filtered(`areaId = '${areaId}' AND slug = '${slug}'`);
    try {
      realm.write(() => {
        realm.delete(existingAlerts);
      });
    } catch (e) {
      console.warn('Error cleaning db', e);
    }
    const alertsArray = d3Dsv.csvParse(alerts);
    realm.write(() => {
      alertsArray.forEach((alert) => {
        realm.create('Alert', {
          slug,
          areaId,
          date: parseInt(alert.date, 10),
          lat: parseFloat(alert.lat, 10),
          long: parseFloat(alert.lon, 10)
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

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_AREAS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_AREAS_COMMIT: {
      let pendingData = state.pendingData;
      const data = [...action.payload];
      data.forEach((newArea) => {
        pendingData = {
          coverage: { ...pendingData.coverage, [newArea.id]: false },
          geostore: { ...pendingData.geostore, [newArea.id]: false },
          alert: { ...pendingData.alert, [newArea.id]: false },
          image: { ...pendingData.image, [newArea.id]: false }
        };
        if (newArea.cache) {
          pendingData.alert = { ...pendingData.alert, [newArea.id]: false };
        }
      });
      return { ...state, data, pendingData, synced: true, syncing: false };
    }
    case GET_AREAS_ROLLBACK: {
      return { ...state, syncing: false };
    }
    case GET_AREA_COVERAGE_REQUEST: {
      const area = action.payload;
      const pendingData = { ...state.pendingData, coverage: { ...state.pendingData.coverage, [area.id]: true } };
      return { ...state, pendingData };
    }
    case GET_AREA_COVERAGE_COMMIT: {
      let pendingData = state.pendingData;
      const data = state.data.map((area) => {
        let updated = area;
        let pendingAlert = { ...pendingData.alert };
        if (area.id === action.meta.area.id) {
          if ((area.datasets && area.datasets.length === 0) || !area.datasets) {
            updated = { ...area, datasets: getInitialDatasets(action.payload) };
            pendingAlert = { ...pendingData.alert, [area.id]: false };
          }
        }
        pendingData = {
          ...pendingData,
          coverage: omit(pendingData.coverage, [area.id]),
          alert: pendingAlert
        };
        return updated;
      });
      return { ...state, data, pendingData };
    }
    case SET_AREA_IMAGE_REQUEST: {
      const area = action.payload;
      const pendingData = { ...state.pendingData, image: { ...state.pendingData.images, [area.id]: true } };
      return { ...state, pendingData };
    }
    case SET_AREA_IMAGE_COMMIT: {
      const area = action.meta.area;
      const images = { ...state.images, [area.id]: action.payload };
      const pendingData = {
        ...state.pendingData,
        image: omit(state.pendingData.image, [area.id])
      };
      return { ...state, images, pendingData };
    }
    case GET_GEOSTORE_REQUEST: {
      const area = action.payload;
      const pendingData = { ...state.pendingData, geostore: { ...state.pendingData.geostore, [area.id]: true } };
      return { ...state, pendingData };
    }
    case GET_GEOSTORE_COMMIT: {
      const area = action.meta.area;
      const pendingData = {
        ...state.pendingData,
        geostore: omit(state.pendingData.geostore, [area.id])
      };
      return { ...state, pendingData };
    }
    case SAVE_AREA_REQUEST: {
      return { ...state, synced: false, syncing: true };
    }
    case SAVE_AREA_ROLLBACK: {
      return { ...state, syncing: false };
    }
    case SAVE_AREA_COMMIT: {
      let data = state.data;
      const area = action.payload;
      let pendingData = state.pendingData;
      if (area) {
        data = [...data, area];
        const { coverage, geostore, image, alert } = state.pendingData;
        pendingData = {
          coverage: { ...coverage, [area.id]: false },
          geostore: { ...geostore, [area.id]: false },
          image: { ...image, [area.id]: false },
          alert: { ...alert }
        };
      }
      return { ...state, data, pendingData, synced: true, syncing: false };
    }
    case UPDATE_AREA_REQUEST: {
      let pendingData = state.pendingData;
      const { area: newArea, updateCache } = action.payload;
      const areas = state.data.map((area) => {
        if (area.id === newArea.id) {
          if (updateCache) {
            pendingData = {
              alert: { ...pendingData.alert, [area.id]: false }
            };
          }
          return { ...newArea };
        }
        return area;
      });
      return { ...state, data: areas, pendingData, synced: false, syncing: true };
    }
    case UPDATE_AREA_COMMIT: {
      const newArea = action.payload;
      const data = state.data.map((area) => {
        if (area.id === newArea.id) {
          return {
            ...newArea
          };
        }
        return area;
      });
      return { ...state, data, synced: true, syncing: false };
    }
    case UPDATE_AREA_ROLLBACK: {
      const oldArea = action.meta;
      const areas = state.data.map((area) => {
        if (area.id === oldArea.id) {
          return {
            ...oldArea
          };
        }
        return area;
      });
      return { ...state, data: areas };
    }
    case GET_ALERTS_REQUEST: {
      const area = action.payload;
      const data = getUpdatedAreas(state.data, area);
      const pendingData = { ...state.pendingData, alert: { ...state.pendingData.alert, [area.id]: true } };
      return { ...state, data, pendingData };
    }
    case GET_ALERTS_COMMIT: {
      const area = action.meta.area;
      const pendingData = {
        ...state.pendingData,
        alert: omit(state.pendingData.alert, [area.id])
      };

      const data = state.data.map((a) => {
        if (a.id === area.id) {
          const datasets = a.datasets.map((dataset) => {
            if (dataset.slug === action.meta.datasetSlug) {
              return { ...dataset, lastUpdate: Date.now() };
            }
            return dataset;
          });
          return { ...a, datasets };
        }
        return a;
      });
      saveAlertsToDb(action.meta.area.id, action.meta.datasetSlug, action.payload);
      return { ...state, pendingData, data };
    }
    case GET_ALERTS_ROLLBACK: {
      const area = action.meta.area;
      const data = [...state.data, area];
      const pendingData = {
        ...state.pendingData,
        alert: { ...state.pendingData.alert, [area.id]: false }
      };
      return { ...state, data, pendingData };
    }
    case REMOVE_CACHE_AREA_REQUEST: {
      const area = action.payload;
      const data = getUpdatedAreas(state.data, area);
      const pendingData = { ...state.pendingData, alert: { ...state.pendingData.alert, [area.id]: true } };
      return { ...state, data, pendingData };
    }
    case REMOVE_CACHE_AREA_COMMIT: {
      const area = action.meta.area;
      const pendingData = {
        ...state.pendingData,
        alert: omit(state.pendingData.alert, [area.id])
      };
      return { ...state, pendingData };
    }
    case REMOVE_CACHE_AREA_ROLLBACK: {
      const area = action.meta.area;
      const data = [...state.data, area];
      const pendingData = {
        ...state.pendingData,
        alert: { ...state.pendingData.alert, [area.id]: false }
      };
      return { ...state, data, pendingData };
    }
    case DELETE_AREA_REQUEST: {
      const data = state.data.filter((area) => (
        area.id !== action.payload.id
      ));
      return { ...state, data, synced: false, syncing: true };
    }
    case DELETE_AREA_COMMIT: {
      const { id } = action.meta.area || {};
      let images = state.images;
      if (typeof images[id] !== 'undefined') {
        images = omit(images, [id]);
      }
      // Update the selectedIndex of the map
      let selectedIndex = state.selectedIndex || 0;
      if (selectedIndex > 0) {
        let deletedIndex = 0;
        for (let i = 0; i < state.data.length; i++) {
          if (state.data[i].id === id) {
            deletedIndex = i;
            break;
          }
        }
        if (deletedIndex <= selectedIndex) {
          selectedIndex -= 1;
        }
      }
      return { ...state, images, synced: true, syncing: false, selectedIndex };
    }
    case DELETE_AREA_ROLLBACK: {
      const data = [...state.data, action.meta.area];
      return { ...state, data, syncing: false };
    }
    case UPDATE_INDEX: {
      return Object.assign({}, state, { selectedIndex: action.payload });
    }
    case LOGOUT_REQUEST: {
      resetAlertsDb();
      return initialState;
    }
    default:
      return state;
  }
}

export function getAreas() {
  const url = `${Config.API_URL}/area`;
  return {
    type: GET_AREAS_REQUEST,
    meta: {
      offline: {
        effect: { url },
        commit: { type: GET_AREAS_COMMIT },
        rollback: { type: GET_AREAS_ROLLBACK }
      }
    }
  };
}

export function getAreaGeostore(areaId) {
  return async (dispatch, state) => {
    const { areas, geostore } = state();
    const area = getAreaById(areas.data, areaId);
    const geostores = geostore.data;
    if (!geostores[area.geostore] || (geostores[area.geostore] && !geostores[area.geostore].data)) {
      dispatch(getGeostore(area));
    } else {
      dispatch({
        type: GET_GEOSTORE_COMMIT,
        payload: { ...geostores[area.geostore].data, id: area.geostore },
        meta: { area }
      });
    }
  };
}

export function cacheAreaImage(areaId) {
  return (dispatch, state) => {
    const areas = state().areas;
    const area = getAreaById(areas.data, areaId);
    const images = { ...areas.images };
    if (!images[area.id]) {
      dispatch({
        type: SET_AREA_IMAGE_REQUEST,
        payload: area,
        meta: {
          offline: {
            effect: { promise: getCachedImageByUrl(area.image, 'areas') },
            commit: { type: SET_AREA_IMAGE_COMMIT, meta: { area } }
          }
        }
      });
    }
  };
}

export function getAreaCoverage(areaId) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const url = `${Config.API_URL}/coverage/intersect?geostore=${area.geostore}`;
    dispatch({
      type: GET_AREA_COVERAGE_REQUEST,
      payload: area,
      meta: {
        offline: {
          effect: { url },
          commit: { type: GET_AREA_COVERAGE_COMMIT, meta: { area } },
          rollback: { type: GET_AREA_COVERAGE_ROLLBACK }
        }
      }
    });
  };
}

export function updateArea(area, updateCache) {
  return async (dispatch, state) => {
    const url = `${Config.API_URL}/area/${area.id}`;
    const originalArea = getAreaById(state().areas.data, area.id);
    const headers = { 'content-type': 'multipart/form-data' };
    const body = new FormData();
    if (area.name) {
      body.append('name', area.name);
    }
    if (area.datasets) {
      body.append('datasets', JSON.stringify(area.datasets));
    }
    dispatch({
      type: UPDATE_AREA_REQUEST,
      payload: { area, updateCache },
      meta: {
        offline: {
          effect: { url, method: 'PATCH', headers, body },
          commit: { type: UPDATE_AREA_COMMIT },
          rollback: { type: UPDATE_AREA_ROLLBACK, meta: originalArea }
        }
      }
    });
  };
}

export function updateSelectedIndex(index) {
  return {
    type: UPDATE_INDEX,
    payload: index
  };
}

export function saveArea(params) {
  const url = `${Config.API_URL}/area`;
  const headers = { 'content-type': 'multipart/form-data' };
  const body = new FormData();
  body.append('name', params.area.name);
  body.append('geostore', params.area.geostore);
  const image = {
    uri: params.snapshot,
    type: 'image/png',
    name: `${encodeURIComponent(params.area.name)}.png`
  };
  if (params.datasets) {
    body.append('datasets', JSON.stringify(params.datasets));
  }
  body.append('image', image);
  return {
    type: SAVE_AREA_REQUEST,
    meta: {
      offline: {
        effect: { url, method: 'POST', headers, body },
        commit: { type: SAVE_AREA_COMMIT },
        rollback: { type: SAVE_AREA_ROLLBACK }
      }
    }
  };
}

export function removeCachedArea(areaId, datasetSlug) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const oldArea = { ...area, datasets: updatedCacheDatasets(area.datasets, datasetSlug, true) };
    const folder = `${CONSTANTS.maps.tilesFolder}/${areaId}/${datasetSlug}`;

    dispatch({
      type: REMOVE_CACHE_AREA_REQUEST,
      payload: area,
      meta: {
        offline: {
          effect: { promise: removeFolder(folder), errorCode: 400 },
          commit: { type: REMOVE_CACHE_AREA_COMMIT, meta: { area } },
          rollback: { type: REMOVE_CACHE_AREA_ROLLBACK, meta: { area: oldArea } }
        }
      }
    });
  };
}

export function setAreaDatasetCache(areaId, datasetSlug, cache) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      const datasets = area.datasets.map((dataset) => {
        if (dataset.slug === datasetSlug) {
          return { ...dataset, cache };
        }
        return dataset;
      });
      const newArea = { ...area, datasets };
      dispatch(updateArea(newArea, true));
    }
  };
}

export function setAreaDatasetStatus(areaId, datasetSlug, status) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      const datasets = area.datasets.map((item) => {
        if (item.slug !== datasetSlug) {
          return status === true
            ? { ...item, active: false }
            : item;
        }
        return { ...item, active: status };
      });
      dispatch(updateArea({ ...area, datasets }));
    }
  };
}

export function updateDate(areaId, datasetSlug, date) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const dateKeys = Object.keys(date) || [];
    if (area) {
      area.datasets = area.datasets.map((d) => {
        const newDataset = d;
        if (d.slug === datasetSlug) {
          dateKeys.forEach((dKey) => {
            if (d[dKey]) {
              newDataset[dKey] = date[dKey];
            }
          });
        }
        return newDataset;
      });
      dispatch(updateArea(area));
    }
  };
}


export function deleteArea(areaId) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      const url = `${Config.API_URL}/area/${area.id}`;
      dispatch({
        type: DELETE_AREA_REQUEST,
        payload: area,
        meta: {
          offline: {
            effect: { url, method: 'DELETE' },
            commit: { type: DELETE_AREA_COMMIT, meta: { area } },
            rollback: { type: DELETE_AREA_ROLLBACK, meta: { area } }
          }
        }
      });
    }
  };
}

export function getAreaAlerts(areaId, datasetSlug) {
  return (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    // const activeDataset = activeDataset(area);
    // we are always requesting all of the data so the filter is only for the map locally
    // for viirs we have the last 7 days and 12 months for glad
    const range = datasetSlug === 'viirs' ? 7 : 12;
    const url = `${Config.API_URL}/fw-alerts/${datasetSlug}/${area.geostore}?range=${range}&format=csv`;
    const oldArea = { ...area, datasets: updatedCacheDatasets(area.datasets, datasetSlug, false) };

    dispatch({
      type: GET_ALERTS_REQUEST,
      payload: area,
      meta: {
        offline: {
          effect: { url, deserialize: false },
          commit: { type: GET_ALERTS_COMMIT, meta: { area, datasetSlug } },
          rollback: { type: GET_ALERTS_ROLLBACK, meta: { area: oldArea } }
        }
      }
    });
  };
}

export function syncAreas() {
  return async (dispatch, state) => {
    const { data, synced, syncing, pendingData } = state().areas;
    const hasAreas = data && data.length;
    if (hasAreas && synced && getActionsTodoCount(pendingData) > 0) {
      Object.keys(pendingData).forEach((type) => {
        const syncingAreasData = pendingData[type];
        const canDispatch = id => (typeof syncingAreasData[id] !== 'undefined' && syncingAreasData[id] === false);
        const syncAreasData = (action) => {
          Object.keys(syncingAreasData).forEach(id => {
            if (canDispatch(id)) {
              action(id);
            }
          });
        };
        switch (type) {
          case 'geostore':
            syncAreasData(id => dispatch(getAreaGeostore(id)));
            break;
          case 'coverage':
            syncAreasData(id => dispatch(getAreaCoverage(id)));
            break;
          case 'image':
            syncAreasData(id => dispatch(cacheAreaImage(id)));
            break;
          case 'alert':
            syncAreasData((id) => {
              const area = getAreaById(state().areas.data, id);
              const { datasets } = area;
              if (datasets) {
                datasets.forEach((dataset) => {
                  if (dataset.cache) {
                    dispatch(getAreaAlerts(id, dataset.slug));
                  }
                });
              }
            });
            break;
          default:
        }
      });
    } else if (!hasAreas && !synced && !syncing) {
      dispatch(getAreas());
    }
  };
}
