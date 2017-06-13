import Config from 'react-native-config';
import { getGeostore } from 'redux-modules/geostore';
import { getCachedImageByUrl, removeFolder } from 'helpers/fileManagement';
import { getInitialDatasets } from 'helpers/area';
import BoundingBox from 'boundingbox';
import CONSTANTS from 'config/constants';
import { initDb } from 'helpers/database';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';

const GET_AREAS_REQUEST = 'areas/GET_AREAS_REQUEST';
const GET_ALERTS_REQUEST = 'areas/GET_ALERTS_REQUEST';
const GET_ALERTS_COMMIT = 'areas/GET_ALERTS_COMMIT';
const GET_ALERTS_ROLLBACK = 'areas/GET_ALERTS_ROLLBACK';
const GET_AREAS_COMMIT = 'areas/GET_AREAS_COMMIT';
const GET_AREAS_ROLLBACK = 'areas/GET_AREAS_ROLLBACK';
const SAVE_AREA_REQUEST = 'areas/SAVE_AREA_REQUEST';
export const SAVE_AREA_COMMIT = 'areas/SAVE_AREA_COMMIT';
export const SAVE_AREA_ROLLBACK = 'areas/SAVE_AREA_ROLLBACK';
const GET_AREA_COVERAGE_REQUEST = 'areas/GET_AREA_COVERAGE_REQUEST';
const GET_AREA_COVERAGE_COMMIT = 'areas/GET_AREA_COVERAGE_COMMIT';
const GET_AREA_COVERAGE_ROLLBACK = 'areas/GET_AREA_COVERAGE_ROLLBACK';
const UPDATE_AREA_REQUEST = 'areas/UPDATE_AREA_REQUEST';
const UPDATE_AREA_COMMIT = 'areas/UPDATE_AREA_COMMIT';
const UPDATE_AREA_ROLLBACK = 'areas/UPDATE_AREA_ROLLBACK';
const SET_CACHE_AREA_REQUEST = 'areas/SET_CACHE_AREA_REQUEST';
const SET_CACHE_AREA_COMMIT = 'areas/SET_CACHE_AREA_COMMIT';
const SET_CACHE_AREA_ROLLBACK = 'areas/SET_CACHE_AREA_ROLLBACK';
const REMOVE_CACHE_AREA_REQUEST = 'areas/REMOVE_CACHE_AREA_REQUEST';
const REMOVE_CACHE_AREA_COMMIT = 'areas/REMOVE_CACHE_AREA_COMMIT';
const REMOVE_CACHE_AREA_ROLLBACK = 'areas/REMOVE_CACHE_AREA_ROLLBACK';
const DELETE_AREA_REQUEST = 'areas/DELETE_AREA_REQUEST';
const DELETE_AREA_COMMIT = 'areas/DELETE_AREA_COMMIT';
const DELETE_AREA_ROLLBACK = 'areas/DELETE_AREA_ROLLBACK';
const SET_AREA_IMAGE = 'areas/SET_AREA_IMAGE';
const UPDATE_INDEX = 'areas/UPDATE_INDEX';

// Reducer
const initialState = {
  data: [],
  selectedIndex: 0,
  images: {},
  synced: false,
  syncing: false,
  pendingData: {
    coverage: [],
    geostore: [],
    image: []
  }
};

function getUpdatedAreas(areas, newArea) {
  return areas.map((area) => {
    if (area.id === newArea.id) {
      return newArea;
    }
    return area;
  });
}

function areAllAreasSynced(areas) {
  for (let i = 0, aLength = areas.length; i < aLength; i++) {
    if (!areas[i].synced) {
      return false;
    }
  }
  return true;
}

export function saveAlertsToDb(areaId, slug, alerts) {
  if (alerts.length > 0) {
    const realm = initDb();
    const existingAlerts = realm.objects('Alert').filtered(`areaId = '${areaId}' AND slug = '${slug}'`);
    realm.delete(existingAlerts);

    realm.write(() => {
      alerts.forEach((alert) => {
        const parsedAlert = alert;
        parsedAlert.long = alert.lon;
        parsedAlert.slug = slug;
        parsedAlert.areaId = areaId;
        realm.create('Alert', parsedAlert);
      });
    });
  }
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_AREAS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_AREAS_COMMIT: {
      if (action.payload.length) {
        const pendingData = { ...state.pendingData };
        action.payload.forEach(area => {
          pendingData.coverage.push(area.id);
          pendingData.geostore.push(area.id);
          pendingData.image.push(area.id);
        });
      }
      return { ...state, data: action.payload, synced: true, syncing: false };
    }
    case GET_AREAS_ROLLBACK: {
      return { ...state, syncing: false };
    }
    case GET_ALERTS_COMMIT: {
      saveAlertsToDb(action.meta.areaId, action.meta.slug, action.payload);
      return { ...state, synced: true };
    }
    case GET_ALERTS_ROLLBACK: {
      console.warn('error in getting Json');
      return { ...state, synced: false };
    }
    case GET_AREA_COVERAGE_COMMIT: {
      const areas = [...state.data];
      for (let i = 0, aLength = areas.length; i < aLength; i++) {
        if (areas[i].id === action.meta.id) {
          if (!areas[i].datasets) {
            areas[i].datasets = getInitialDatasets(action.payload);
          } else {
            // TODO: update the existing ones
          }
        }
      }
      return { ...state };
      // return Object.assign({}, state, { data: areas });
    }
    case SET_AREA_IMAGE: {
      const images = action.payload;
      return Object.assign({}, state, { images });
    }
    case SAVE_AREA_REQUEST: {
      return state;
    }
    case SAVE_AREA_ROLLBACK: {
      return state;
    }
    case SAVE_AREA_COMMIT: {
      const areas = state.data.length > 0 ? [...state.data] : [];
      areas.push(action.payload);
      // sync is false because we need to download the image and geostore
      return { ...state, data: areas, synced: false };
    }
    case UPDATE_AREA_REQUEST: {
      const newArea = action.payload;
      const areas = state.data.map((area) => {
        if (area.id === newArea.id) {
          return {
            ...newArea,
            synced: false
          };
        }
        return area;
      });
      return { ...state, data: areas, synced: false };
    }
    case UPDATE_AREA_COMMIT: {
      const newArea = action.payload;
      let synced = true;
      const areas = state.data.map((area) => {
        if (area.id === newArea.id) {
          return {
            ...newArea,
            synced: true,
            lastUpdate: Date.now()
          };
        } else if (!area.synced) {
          synced = false;
        }
        return area;
      });
      return { ...state, data: areas, synced };
    }
    case UPDATE_AREA_ROLLBACK: {
      const oldArea = action.meta;
      let synced = true;
      const areas = state.data.map((area) => {
        if (area.id === oldArea.id) {
          return {
            ...oldArea,
            synced: true,
            lastModify: Date.now()
          };
        } else if (!area.synced) {
          synced = false;
        }
        return area;
      });
      return { ...state, data: areas, synced };
    }
    case SET_CACHE_AREA_REQUEST: {
      const newArea = action.payload;
      const areas = getUpdatedAreas(state.data, newArea);
      return { ...state, data: areas };
    }
    case SET_CACHE_AREA_COMMIT: {
      // TODO: save the stored flag in the dataset cache as true
      return state;
    }
    case SET_CACHE_AREA_ROLLBACK: {
      // TODO: save the stored flag in the dataset cache as false
      return state;
    }
    case DELETE_AREA_REQUEST: {
      const areas = [...state.data];
      const filteredAreas = areas.filter((area) => (
        area.id !== action.payload.id
      ));
      return { ...state, data: filteredAreas, synced: false };
    }
    case DELETE_AREA_COMMIT: {
      const synced = areAllAreasSynced(state.data);
      const { id } = action.meta.area || {};
      const images = { ...state.images };
      if (typeof images[id] !== 'undefined') {
        delete images[id];
      }
      return { ...state, images, synced };
    }
    case DELETE_AREA_ROLLBACK: {
      const synced = areAllAreasSynced(state.data);
      const areas = [...state.data];
      areas.push(action.meta.area);
      return { ...state, data: areas, synced };
    }
    case UPDATE_INDEX: {
      return Object.assign({}, state, { selectedIndex: action.payload });
    }
    case LOGOUT_REQUEST: {
      return initialState;
    }
    default:
      return state;
  }
}

// Helpers
function getAreaById(areas, areaId) {
  // Using deconstructor to generate a new object
  return { ...areas.find((areaData) => (areaData.id === areaId)) };
}

function updatedCacheDatasets(datasets, datasetSlug, status) {
  if (!datasets) return [];
  return datasets.map((d) => {
    const newDataset = d;
    if (d.slug === datasetSlug) {
      newDataset.cache = status;
    }
    return newDataset;
  });
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
    const area = getAreaById(state().areas.data, areaId);
    const geostores = state().geostore.data;
    if (!geostores[area.geostore]) {
      dispatch(getGeostore(area.geostore));
    }
  };
}

export function cacheAreaImage(areaId) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const images = Object.assign({}, state().areas.images);
    if (!images[area.id]) {
      images[area.id] = await getCachedImageByUrl(area.image, 'areas');
      dispatch({
        type: SET_AREA_IMAGE,
        payload: images
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
          effect: { url, meta: area },
          commit: { type: GET_AREA_COVERAGE_COMMIT, meta: area },
          rollback: { type: GET_AREA_COVERAGE_ROLLBACK }
        }
      }
    });
  };
}

export function updateArea(area) {
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
      payload: area,
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
  return (dispatch) => {
    const headers = { 'content-type': 'multipart/form-data' };
    const body = new FormData();
    body.append('name', params.area.name);
    body.append('geostore', params.area.geostore);
    const image = {
      uri: params.snapshot,
      type: 'image/png',
      name: `${params.area.name}.png`
    };
    if (params.datasets) {
      body.append('datasets', JSON.stringify(params.datasets));
    }
    body.append('image', image);
    dispatch({
      type: SAVE_AREA_REQUEST,
      meta: {
        offline: {
          effect: { url, method: 'POST', headers, body },
          commit: { type: SAVE_AREA_COMMIT },
          rollback: { type: SAVE_AREA_ROLLBACK }
        }
      }
    });
  };
}

export function cacheArea(areaId, datasetSlug) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const geostore = state().geostore.data[area.geostore];
    let bbox = null;
    if (geostore) {
      const bboxArea = new BoundingBox(geostore.geojson.features[0]);
      if (bboxArea) {
        bbox = [
          { lat: bboxArea.minlat, lng: bboxArea.maxlon },
          { lat: bboxArea.maxlat, lng: bboxArea.minlon }
        ];
      }
    }
    if (bbox) {
      const newArea = { ...area };
      newArea.datasets = updatedCacheDatasets(area.datasets, datasetSlug, true);
      const url = `/fw-alerts/${datasetSlug}/${area.geostore}`;
      dispatch({
        type: SET_CACHE_AREA_REQUEST,
        payload: newArea,
        meta: {
          offline: {
            effect: { url, deserialize: false },
            commit: { type: SET_CACHE_AREA_COMMIT, meta: { newArea } },
            rollback: { type: SET_CACHE_AREA_ROLLBACK, meta: { area } }
          }
        }
      });
    }
  };
}


export function removeCachedArea(areaId, datasetSlug) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const folder = `${CONSTANTS.maps.tilesFolder}/${areaId}/${datasetSlug}`;
    const newArea = { ...area };
    newArea.datasets = updatedCacheDatasets(area.datasets, datasetSlug, false);
    dispatch({
      type: REMOVE_CACHE_AREA_REQUEST,
      payload: newArea,
      meta: {
        offline: {
          effect: { promise: removeFolder(folder), errorCode: 400 },
          commit: { type: REMOVE_CACHE_AREA_COMMIT },
          rollback: { type: REMOVE_CACHE_AREA_ROLLBACK, meta: { area } }
        }
      }
    });
  };
}

export function setAreaDatasetStatus(areaId, datasetSlug, status) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      area.datasets = area.datasets.map((item) => {
        if (item.slug !== datasetSlug) {
          return status === true
            ? { ...item, active: false }
            : item;
        }
        return { ...item, active: status };
      });
      dispatch(updateArea(area));
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
    const url = `${Config.API_URL}/fw-alerts/${datasetSlug}/${area.geostore}`;

    dispatch({
      type: GET_ALERTS_REQUEST,
      meta: {
        offline: {
          effect: { url, deserialize: false },
          commit: { type: GET_ALERTS_COMMIT, meta: { areaId, slug: datasetSlug } },
          rollback: { type: GET_ALERTS_ROLLBACK }
        }
      }
    });
  };
}

export function syncAreas() {
  return async (dispatch, state) => {
    const areas = state().areas;
    const hasAreas = areas.data && areas.data.length;
    if (hasAreas && areas.synced) {
      // TODO: loop trough the pendingData
      // dispatch(getAreaGeostore(area.id));
      // dispatch(getAreaCoverage(area.id));
      // dispatch(cacheAreaImage(area.id));
      // dispatch(getAreaAlerts(area.id));
    } else if (!areas.synced && !areas.syncing) {
      dispatch(getAreas());
    }
  };
}
