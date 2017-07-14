import Config from 'react-native-config';
import omit from 'lodash/omit';
import CONSTANTS from 'config/constants';
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
// const CACHE_LAYER_REQUEST = 'layer/CACHE_LAYER_REQUEST';
// const CACHE_LAYER_REQUEST = 'layer/CACHE_LAYER_REQUEST';
// const CACHE_LAYER_COMMIT = 'layer/CACHE_LAYER_COMMIT';

const BoundingBox = require('boundingbox');

// TODO: use when support 512 custom tiles size
// const BASEMAP_URL = PixelRatio.get() >= 2 ? CONSTANTS.maps.basemapHD : CONSTANTS.maps.basemap;
const URL_BASEMAP_TEMPLATE = `${CONSTANTS.maps.basemap}?access_token=${Config.MAPBOX_TOKEN}`;

// Reducer
const initialState = {
  data: [], // TODO: normalize
  synced: false,
  syncing: false,
  activeLayer: null,
  basemap: {}, // save the basemap path for each area
  pendingData: {
    basemap: {},
    areas: {} // TODO: multiple layers support
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_LAYERS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_LAYERS_COMMIT: {
      const data = [...action.payload];
      return { ...state, data, synced: true, syncing: false };
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
      const pendingData = {
        ...state.pendingData,
        basemap: {
          ...basemap,
          [area.id]: false
        } // TODO: include layers too
      };
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
      const basemap = {
        ...state.basemap,
        [area.id]: path
      };
      return { ...state, basemap, pendingData };
    }
    // case CACHE_LAYER_REQUEST: {
    //   const areaId = action.payload.areaId;
    //   const pendingData = {
    //     ...state.pendingData,
    //     coverage: {
    //       ...state.pendingData.coverage,
    //       [areaId]: true
    //     }
    //   };
    //   return { ...state, pendingData };
    // }
    // case CACHE_LAYER_COMMIT: {
    //   const areaId = action.payload.areaId;
    //   const pendingData = {
    //     ...state.pendingData,
    //     areas: omit(state.pendingData.areas, [areaId])
    //   };
    //   return { ...state, pendingData };
    // }
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
  const { bbox, areaId, layerName, layerUrl } = config;
  const zooms = CONSTANTS.maps.cachedZoomLevels;
  const tiles = getTilesInBbox(bbox, zooms);
  const cacheConfig = { tiles, areaId, layerName, layerUrl };
  return await cacheTiles(cacheConfig);
}

function getAreaById(areas, areaId) {
  // Using deconstructor to generate a new object
  return { ...areas.find((areaData) => (areaData.id === areaId)) };
}

export function cacheAreaBasemap(areaId) {
  return (dispatch, state) => {
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
      const downloadConfig = {
        bbox,
        areaId,
        layerName: 'basemap',
        layerUrl: URL_BASEMAP_TEMPLATE
      };
      const promise = downloadLayer(downloadConfig);
      dispatch({
        type: CACHE_BASEMAP_REQUEST,
        payload: area,
        meta: {
          offline: {
            effect: { promise },
            commit: { type: CACHE_BASEMAP_COMMIT, meta: { area } },
            rollback: { type: CACHE_BASEMAP_ROLLBACK }
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
      Object.keys(pendingData).forEach((type) => {
        const syncingLayersData = pendingData[type];
        const canDispatch = id => (typeof syncingLayersData[id] !== 'undefined' && syncingLayersData[id] === false);
        const syncLayersData = (action) => {
          Object.keys(syncingLayersData).forEach(id => {
            if (canDispatch(id)) {
              action(id);
            }
          });
        };
        switch (type) {
          case 'basemap':
            syncLayersData(id => dispatch(cacheAreaBasemap(id)));
            break;
          default:
        }
      });
    }
  };
}
