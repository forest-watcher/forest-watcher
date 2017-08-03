import Config from 'react-native-config';
import { Platform } from 'react-native';
import omit from 'lodash/omit';
import CONSTANTS from 'config/constants';
import RNFetchBlob from 'react-native-fetch-blob';
import { unzip } from 'react-native-zip-archive';
import { getActionsTodoCount } from 'helpers/sync';
import { removeFolder } from 'helpers/fileManagement';

import { LOGOUT_REQUEST } from 'redux-modules/user';
import { START_APP } from 'redux-modules/app';

const GET_LAYERS_REQUEST = 'layers/GET_LAYERS_REQUEST';
const GET_LAYERS_COMMIT = 'layers/GET_LAYERS_COMMIT';
const GET_LAYERS_ROLLBACK = 'layers/GET_LAYERS_ROLLBACK';
const SET_ACTIVE_LAYER = 'layer/SET_ACTIVE_LAYER';
const CACHE_BASEMAP_REQUEST = 'layer/CACHE_BASEMAP_REQUEST';
const CACHE_BASEMAP_COMMIT = 'layers/CACHE_BASEMAP_COMMIT';
export const CACHE_BASEMAP_ROLLBACK = 'layers/CACHE_BASEMAP_ROLLBACK';
const CACHE_LAYER_REQUEST = 'layers/CACHE_LAYER_REQUEST';
const CACHE_LAYER_COMMIT = 'layers/CACHE_LAYER_COMMIT';
export const CACHE_LAYER_ROLLBACK = 'layer/CACHE_LAYER_ROLLBACK';

// Reducer
const initialState = {
  data: [],
  synced: false,
  syncing: false,
  activeLayer: null,
  syncDate: Date.now(),
  cacheProgress: {
    '5943d3d39522f8001094462e': {
      progress: 0,
      complete: false,
      requested: false
    },
    '595dfb85c806a20010d8a031': {
      progress: 0.2,
      complete: false,
      requested: true
    },
    '5979e791941179001105cca2': {
      progress: 0,
      complete: true,
      requested: false
    }
  },
  cache: { // save the layers path for each area
    basemap: {}
  },
  pendingData: {
    basemap: {}
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case START_APP: {
      return { ...state, synced: false, syncing: false };
    }
    case GET_LAYERS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_LAYERS_COMMIT: {
      const layers = [...action.payload];
      let pendingData = { ...state.pendingData };
      const areas = [...action.meta.areas];
      const cache = { ...state.cache };
      const syncDate = Date.now();

      const isAndroid = Platform.OS === 'android'; // TODO: remove this on iOS cache ready
      if (isAndroid) {
        pendingData = getCachePendingData({ areas, layers, cache, pendingData });
      }

      return { ...state, data: layers, syncDate, synced: true, syncing: false, pendingData };
    }
    case GET_LAYERS_ROLLBACK: {
      return { ...state, syncing: false };
    }
    case SET_ACTIVE_LAYER:
      return { ...state, activeLayer: action.payload };
    case CACHE_BASEMAP_REQUEST: {
      const area = action.payload;
      const { basemap } = state.pendingData;
      const pendingData = {
        ...state.pendingData,
        basemap: {
          ...basemap,
          [area.id]: true
        }
      };
      return { ...state, pendingData };
    }
    case CACHE_BASEMAP_COMMIT: {
      const { area } = action.meta;
      let path = action.payload;
      path = (path && path.length > 0) ? path[0] : path;
      const pendingData = {
        ...state.pendingData,
        basemap: omit(state.pendingData.basemap, [area.id])
      };
      const cache = {
        ...state.cache,
        basemap: {
          ...state.cache.basemap,
          [area.id]: path
        }
      };
      return { ...state, cache, pendingData };
    }
    case CACHE_BASEMAP_ROLLBACK: {
      const { area } = action.meta;
      const { basemap } = state.pendingData;
      const pendingData = {
        ...state.pendingData,
        basemap: {
          ...basemap,
          [area.id]: false
        }
      };
      return { ...state, pendingData };
    }
    case CACHE_LAYER_REQUEST: {
      const { area, layer } = action.payload;
      const pendingData = {
        ...state.pendingData,
        [layer.id]: {
          ...state.pendingData[layer.id],
          [area.id]: true
        }
      };
      return { ...state, pendingData };
    }
    case CACHE_LAYER_COMMIT: {
      const { area, layer } = action.meta;
      let path = action.payload;
      path = (path && path.length > 0) ? path[0] : path;
      const pendingData = {
        ...state.pendingData,
        [layer.id]: omit(state.pendingData[layer.id], [area.id])
      };
      const cache = {
        ...state.cache,
        [layer.id]: {
          ...state.cache[layer.id],
          [area.id]: path
        }
      };
      return { ...state, cache, pendingData };
    }
    case CACHE_LAYER_ROLLBACK: {
      const { area, layer } = action.meta;
      const pendingData = {
        ...state.pendingData,
        [layer.id]: {
          ...state.pendingData[layer.id],
          [area.id]: false
        }
      };
      return { ...state, pendingData };
    }
    case 'layers/DOWNLOAD_AREA': {
      const { areaId, requested } = action.payload;
      const areaProgress = state.cacheProgress[areaId];
      const cacheProgress = { ...state.cacheProgress, [areaId]: { ...areaProgress, requested } };
      return { ...state, cacheProgress };
    }
    case LOGOUT_REQUEST:
      removeFolder(CONSTANTS.files.tiles);
      return initialState;
    default:
      return state;
  }
}

export function getUserLayers() {
  return (dispatch, state) => {
    const url = `${Config.API_URL}/contextual-layer/?enabled=true`;
    const areas = state().areas.data;
    return dispatch({
      type: GET_LAYERS_REQUEST,
      meta: {
        offline: {
          effect: { url },
          commit: { type: GET_LAYERS_COMMIT, meta: { areas } },
          rollback: { type: GET_LAYERS_ROLLBACK }
        }
      }
    });
  };
}

export function setActiveContextualLayer(layerId, value) {
  return (dispatch, state) => {
    let activeLayer = null;
    if (layerId !== state().layers.activeLayer && value) activeLayer = layerId;
    return dispatch({ type: SET_ACTIVE_LAYER, payload: activeLayer });
  };
}

async function downloadLayer(config) {
  const { area, layerId, layerUrl, zoom } = config;
  const url = `${Config.API_URL}/download-tiles/${area.geostore}/${zoom.start}/${zoom.end}?layerUrl=${layerUrl}`;
  const res = await RNFetchBlob
    // add this option that makes response data to be stored as a file,
    // this is much more performant.
    .config({ fileCache: true })
    .fetch('GET', encodeURI(url));
  const statusCode = res.info().status;
  if (statusCode >= 200 && statusCode < 400 && res.path()) {
    const downloadPath = res.path();
    const tilesPath = `${CONSTANTS.files.tiles}/${area.id}/${layerId}`;
    const targetPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${tilesPath}`;
    await unzip(downloadPath, targetPath);
    res.flush(); // remove from the cache
    return `${tilesPath}/{z}x{x}x{y}`;
  }
  throw new Error(`Fetch blob error ${statusCode}`);
}

function downloadAllLayers(config) {
  const { cacheZoom } = CONSTANTS.maps;
  return Promise.all(cacheZoom.map((cacheLevel) => {
    const layerConfig = { ...config, zoom: cacheLevel };
    return downloadLayer(layerConfig);
  }, this));
}


function getAreaById(areas, areaId) {
  // Using deconstructor to generate a new object
  return { ...areas.find((areaData) => (areaData.id === areaId)) };
}

function getLayerById(layers, layerId) {
  if (!layers) return null;
  // Using deconstructor to generate a new object
  return { ...layers.find((layer) => (layer.id === layerId)) };
}

export function cacheAreaBasemap(areaId) {
  return (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      const downloadConfig = {
        area,
        layerId: 'basemap',
        layerUrl: CONSTANTS.maps.basemap
      };

      const promise = downloadAllLayers(downloadConfig);
      dispatch({
        type: CACHE_BASEMAP_REQUEST,
        payload: area,
        meta: {
          offline: {
            effect: { promise, errorCode: 400 },
            commit: { type: CACHE_BASEMAP_COMMIT, meta: { area } },
            rollback: { type: CACHE_BASEMAP_ROLLBACK, meta: { area } }
          }
        }
      });
    }
  };
}

// TODO: refactor to use the same download layer logic
export function cacheAreaLayer(areaId, layerId) {
  return (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const layer = getLayerById(state().layers.data, layerId);
    if (area && layer) {
      const downloadConfig = {
        area,
        layerId: layer.id,
        layerUrl: layer.url
      };
      const promise = downloadAllLayers(downloadConfig);
      dispatch({
        type: CACHE_LAYER_REQUEST,
        payload: { area, layer },
        meta: {
          offline: {
            effect: { promise, errorCode: 400 },
            commit: { type: CACHE_LAYER_COMMIT, meta: { area, layer } },
            rollback: { type: CACHE_LAYER_ROLLBACK, meta: { area, layer } }
          }
        }
      });
    }
  };
}

export function syncLayers() {
  return (dispatch, state) => {
    const { synced, syncing, pendingData } = state().layers;
    const hasAreas = state().areas.data.length;
    if (!synced && !syncing && hasAreas) dispatch(getUserLayers());
    if (getActionsTodoCount(pendingData) > 0) {
      Object.keys(pendingData).forEach((layer) => {
        const syncingLayersData = pendingData[layer];
        const canDispatch = id => (typeof syncingLayersData[id] !== 'undefined' && syncingLayersData[id] === false);
        const syncLayersData = (action) => {
          Object.keys(syncingLayersData).forEach(id => {
            if (canDispatch(id)) {
              action(id);
            }
          });
        };
        switch (layer) {
          case 'basemap':
            syncLayersData(id => dispatch(cacheAreaBasemap(id)));
            break;
          default:
            syncLayersData(id => dispatch(cacheAreaLayer(id, layer)));
        }
      });
    }
  };
}

function getCachePendingData({ areas = [], layers = [], cache = {}, pendingData = {} } = {}) {
  let cachePendingData = { ...pendingData };
  areas.forEach((area) => {
    if (!cache.basemap[area.id]) {
      cachePendingData = {
        ...cachePendingData,
        basemap: {
          ...cachePendingData.basemap,
          [area.id]: false
        }
      };
    }
    layers.forEach((layer) => {
      if (!cache[layer.id] || (cache[layer.id] && !cache[layer.id][area.id])) {
        cachePendingData = {
          ...cachePendingData,
          [layer.id]: {
            ...cachePendingData[layer.id],
            [area.id]: false
          }
        };
      }
    });
  });
  return cachePendingData;
}

export function downloadArea(areaId) {
  return {
    type: 'layers/DOWNLOAD_AREA',
    payload: {
      areaId,
      requested: true
    }
  };
}
