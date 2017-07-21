import Config from 'react-native-config';
import omit from 'lodash/omit';
import CONSTANTS from 'config/constants';
import RNFetchBlob from 'react-native-fetch-blob';
import { unzip } from 'react-native-zip-archive';
import { getTilesInBbox } from 'helpers/map';
import { cacheTiles } from 'helpers/fileManagement';
import { getActionsTodoCount } from 'helpers/sync';

import { GET_GEOSTORE_COMMIT } from 'redux-modules/geostore';
import { LOGOUT_REQUEST } from 'redux-modules/user';

const GET_LAYERS_REQUEST = 'layers/GET_LAYERS_REQUEST';
const GET_LAYERS_COMMIT = 'layers/GET_LAYERS_COMMIT';
const GET_LAYERS_ROLLBACK = 'layers/GET_LAYERS_ROLLBACK';
const SET_ACTIVE_LAYER = 'layer/SET_ACTIVE_LAYER';
const CACHE_BASEMAP_REQUEST = 'layer/CACHE_BASEMAP_REQUEST';
const CACHE_BASEMAP_COMMIT = 'layer/CACHE_BASEMAP_COMMIT';
const CACHE_BASEMAP_ROLLBACK = 'layer/CACHE_BASEMAP_ROLLBACK';
const CACHE_LAYER_REQUEST = 'layer/CACHE_LAYER_REQUEST';
const CACHE_LAYER_COMMIT = 'layer/CACHE_LAYER_COMMIT';

const BoundingBox = require('boundingbox');

// TODO: use when support 512 custom tiles size
// const BASEMAP_URL = PixelRatio.get() >= 2 ? CONSTANTS.maps.basemapHD : CONSTANTS.maps.basemap;
const URL_BASEMAP_TEMPLATE = `${CONSTANTS.maps.basemap}?access_token=${Config.MAPBOX_TOKEN}`;

// Reducer
const initialState = {
  data: [],
  synced: false,
  syncing: false,
  activeLayer: null,
  cache: { // save the layers path for each area
    basemap: {}
  },
  pendingData: {
    basemap: {}
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_LAYERS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_LAYERS_COMMIT: {
      const data = [...action.payload];
      return { ...state, data, synced: true, syncing: false };
      // TODO: check if geostores was synced before and include in the pendingData
    }
    case GET_LAYERS_ROLLBACK: {
      const data = [...action.meta.layers];
      return { ...state, data, syncing: false };
    }
    case SET_ACTIVE_LAYER:
      return { ...state, activeLayer: action.payload };
    case GET_GEOSTORE_COMMIT: {
      const { area } = action.meta;
      const { basemap } = state.pendingData;
      let pendingData = {
        ...state.pendingData,
        basemap: {
          ...basemap,
          [area.id]: false
        }
      };
      if (state.synced) {
        const pendingLayers = {};
        state.data.forEach((layer) => {
          pendingLayers[layer.id] = {
            [area.id]: false
          };
        }, this);
        pendingData = {
          ...pendingData,
          ...pendingLayers
        };
      }
      return { ...state, pendingData };
    }
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
      const area = action.meta.area;
      const path = action.payload;
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
      const path = action.payload;
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
    case LOGOUT_REQUEST:
      return initialState;
    default:
      return state;
  }
}

export function getUserLayers() {
  return (dispatch, state) => {
    const layers = state().layers.data;
    const url = `${Config.API_URL}/contextual-layer/?enabled=true`;
    return dispatch({
      type: GET_LAYERS_REQUEST,
      meta: {
        offline: {
          effect: { url },
          commit: { type: GET_LAYERS_COMMIT },
          rollback: { type: GET_LAYERS_ROLLBACK, meta: { layers } }
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
  const { start, end } = CONSTANTS.maps.cacheZoom;
  const { area, layerId, layerUrl } = config;
  const url = `${Config.API_URL}/area/download-tiles/${area.geostore}/${start}/${end}?urlTile=${layerUrl}`;
  try {
    const res = await RNFetchBlob
      // add this option that makes response data to be stored as a file,
      // this is much more performant.
      .config({ fileCache: true })
      .fetch('GET', url);
    const downloadPath = res.path();
    if (downloadPath) {
      const targetPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${CONSTANTS.maps.tilesFolder}/1234/${layerId}` // TODO: fix 1234 as area ID

      const path = await unzip(downloadPath, targetPath);
      tron.log('unzipped folder is');
      tron.log(path);
      return path;
    } else {
      throw new Error('Download path error');
    }
  } catch(e) {
    throw new Error(e);
  }
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
    const geostore = state().geostore.data[area.geostore];
    let bbox = null;
    if (geostore) {
      // TODO: refactor this to get directly the bbox of the geostore
      const bboxArea = new BoundingBox(geostore.geojson.features[0]);
      if (bboxArea) {
        bbox = [
          { lat: bboxArea.minlat, lng: bboxArea.maxlon },
          { lat: bboxArea.maxlat, lng: bboxArea.minlon }
        ];
      }
    }
    if (bbox) {
      const downloadConfig = {
        area,
        layerId: 'basemap',
        layerUrl: URL_BASEMAP_TEMPLATE
      };

      const promise = downloadLayer(downloadConfig);
      dispatch({
        type: CACHE_BASEMAP_REQUEST,
        payload: area,
        meta: {
          offline: {
            effect: { promise },
            commit: { type: CACHE_BASEMAP_COMMIT, meta: { area, layerId: 'basemap' } },
            rollback: { type: CACHE_BASEMAP_ROLLBACK }
          }
        }
      });
    }
  };
}

export function cacheAreaLayer(areaId, layerId) {
  return (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const geostore = state().geostore.data[area.geostore];
    let bbox = null;
    if (geostore) {
      // TODO: refactor this to get directly the bbox of the geostore
      const bboxArea = new BoundingBox(geostore.geojson.features[0]);
      if (bboxArea) {
        bbox = [
          { lat: bboxArea.minlat, lng: bboxArea.maxlon },
          { lat: bboxArea.maxlat, lng: bboxArea.minlon }
        ];
      }
    }
    const layer = getLayerById(state().layers.data, layerId);
    if (bbox && layer) {
      const downloadConfig = {
        bbox,
        areaId,
        layerId: layer.id,
        layerUrl: layer.url
      };
      const promise = downloadLayer(downloadConfig);
      dispatch({
        type: CACHE_LAYER_REQUEST,
        payload: { area, layer },
        meta: {
          offline: {
            effect: { promise },
            commit: { type: CACHE_LAYER_COMMIT, meta: { area, layer } }
          }
        }
      });
    }
  };
}

export function syncLayers() {
  return (dispatch, state) => {
    const { layers } = state();
    if (!layers.synced && !layers.syncing) dispatch(getUserLayers());
    const { pendingData } = state().layers;
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
