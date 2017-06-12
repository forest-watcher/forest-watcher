import Config from 'react-native-config';
import omit from 'lodash/omit';
import { getGeostore, GET_GEOSTORE_REQUEST, GET_GEOSTORE_COMMIT } from 'redux-modules/geostore';
import { getCachedImageByUrl, removeFolder } from 'helpers/fileManagement';
import { getBboxTiles, cacheTiles } from 'helpers/map';
import { hasActionsPending } from 'helpers/sync';
import { getInitialDatasets } from 'helpers/area';
import BoundingBox from 'boundingbox';
import CONSTANTS from 'config/constants';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';

const GET_AREAS_REQUEST = 'areas/GET_AREAS_REQUEST';
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
  return datasets.map((d) => {
    const newDataset = d;
    if (d.slug === datasetSlug) {
      newDataset.cache = status;
    }
    return newDataset;
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

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_AREAS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_AREAS_COMMIT: {
      let pendingData = state.pendingData;
      const { coverage, geostore, image, alert } = state.pendingData;
      const data = [...action.payload];
      data.forEach((newArea) => {
        pendingData = {
          coverage: { ...coverage, [newArea.id]: false },
          geostore: { ...geostore, [newArea.id]: false },
          image: { ...image, [newArea.id]: false },
          alert: { ...alert, [newArea.id]: false }
        };
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
        if (area.id === action.meta.area.id) {
          if ((area.datasets && area.datasets.length === 0) || !area.datasets) {
            updated = { ...area, datasets: getInitialDatasets(action.payload) };
          }
        }
        pendingData = {
          ...pendingData,
          coverage: omit(pendingData.coverage, [area.id])
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
        const { coverage, geostore, image } = state.pendingData;
        pendingData = {
          coverage: { ...coverage, [area.id]: false },
          geostore: { ...geostore, [area.id]: false },
          image: { ...image, [area.id]: false }
        };
      }
      return { ...state, data, pendingData, synced: true, syncing: false };
    }
    case UPDATE_AREA_REQUEST: {
      const newArea = action.payload;
      const areas = state.data.map((area) => {
        if (area.id === newArea.id) {
          return { ...newArea };
        }
        return area;
      });
      return { ...state, data: areas, synced: false, syncing: true };
    }
    case UPDATE_AREA_COMMIT: {
      const newArea = action.payload;
      const areas = state.data.map((area) => {
        if (area.id === newArea.id) {
          return {
            ...newArea,
            lastUpdate: Date.now()
          };
        }
        return area;
      });
      return { ...state, data: areas, synced: true, syncing: false };
    }
    case UPDATE_AREA_ROLLBACK: {
      const oldArea = action.meta;
      const areas = state.data.map((area) => {
        if (area.id === oldArea.id) {
          return {
            ...oldArea,
            lastModify: Date.now()
          };
        }
        return area;
      });
      return { ...state, data: areas };
    }
    case SET_CACHE_AREA_REQUEST: {
      const newArea = action.payload;
      const areas = getUpdatedAreas(state.data, newArea);
      return { ...state, data: areas };
    }
    case SET_CACHE_AREA_COMMIT: {
      const area = action.meta.newArea;
      const pendingData = {
        ...state.pendingData,
        alert: omit(state.pendingData.alert, [area.id])
      };
      return { ...state, pendingData };
    }
    case SET_CACHE_AREA_ROLLBACK: {
      const area = action.meta.area;
      const data = [...state.data, area];
      const pendingData = {
        ...state.pendingData,
        alert: { ...state.pendingData.alert, [area.id]: false }
      };
      return { ...state, data, pendingData };
    }
    case REMOVE_CACHE_AREA_REQUEST: {
      const newArea = action.payload;
      const data = getUpdatedAreas(state.data, newArea);
      return { ...state, data };
    }
    case REMOVE_CACHE_AREA_ROLLBACK: {
      const data = [...state.data, action.meta.area];
      return { ...state, data };
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
      return { ...state, images, synced: true, syncing: false };
    }
    case DELETE_AREA_ROLLBACK: {
      const data = [...state.data, action.meta.area];
      return { ...state, data, syncing: false };
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

async function downloadArea(bbox, areaId, datasetSlug) {
  const zooms = CONSTANTS.maps.cachedZoomLevels;
  const tilesArray = getBboxTiles(bbox, zooms);
  await cacheTiles(tilesArray, areaId, datasetSlug);
  return { tiles: tilesArray, area: areaId, dataset: datasetSlug };
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
    name: `${params.area.name}.png`
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
      const newArea = {
        ...area,
        datasets: updatedCacheDatasets(area.datasets, datasetSlug, true)
      };

      dispatch({
        type: SET_CACHE_AREA_REQUEST,
        payload: newArea,
        meta: {
          offline: {
            effect: { promise: downloadArea(bbox, areaId, datasetSlug), errorCode: 400 },
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
    const newArea = {
      ...area,
      datasets: updatedCacheDatasets(area.datasets, datasetSlug, false)
    };

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

export function syncAreas() {
  return async (dispatch, state) => {
    const { data, synced, syncing, pendingData } = state().areas;
    const hasAreas = data && data.length;
    if (hasAreas && synced && hasActionsPending(pendingData)) {
      Object.keys(pendingData).forEach((type) => {
        const syncingAreasData = pendingData[type];
        const canDispatch = id => (typeof syncingAreasData[id] !== 'undefined' && syncingAreasData[id] === false);
        const syncAreasData = (action, ...args) => {
          Object.keys(syncingAreasData).forEach(id => {
            if (canDispatch(id)) action(id, ...args);
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
              datasets.forEach((dataset) => {
                if (!dataset.cache) {
                  dispatch(cacheArea(id, dataset.slug));
                } else {
                  dispatch(removeCachedArea(id, dataset.slug));
                }
              });
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
