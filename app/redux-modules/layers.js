// @flow
import type { LayersState, LayersAction, LayersCacheStatus, LayersProgress } from 'types/layers.types';
import type { Dispatch, GetState, State } from 'types/store.types';

import Config from 'react-native-config';
import omit from 'lodash/omit';
import CONSTANTS from 'config/constants';
import RNFetchBlob from 'rn-fetch-blob';
import { unzip } from 'react-native-zip-archive';
import { getActionsTodoCount } from 'helpers/sync';
import { removeFolder } from 'helpers/fileManagement';

import { LOGOUT_REQUEST } from 'redux-modules/user';
import { SAVE_AREA_COMMIT, DELETE_AREA_COMMIT } from 'redux-modules/areas';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';
import type { Area } from 'types/areas.types';
import type { File } from 'types/file.types';

import tracker from 'helpers/googleAnalytics';

window.DOMParser = require('xmldom').DOMParser;

const togeojson = require('@mapbox/togeojson');
const RNFS = require('react-native-fs');

const GET_LAYERS_REQUEST = 'layers/GET_LAYERS_REQUEST';
const GET_LAYERS_COMMIT = 'layers/GET_LAYERS_COMMIT';
const GET_LAYERS_ROLLBACK = 'layers/GET_LAYERS_ROLLBACK';
const SET_ACTIVE_LAYER = 'layers/SET_ACTIVE_LAYER';
const DOWNLOAD_AREA = 'layers/DOWNLOAD_AREA';
const CACHE_LAYER_REQUEST = 'layers/CACHE_LAYER_REQUEST';
const CACHE_LAYER_COMMIT = 'layers/CACHE_LAYER_COMMIT';
export const CACHE_LAYER_ROLLBACK = 'layer/CACHE_LAYER_ROLLBACK';
const SET_CACHE_STATUS = 'layer/SET_CACHE_STATUS';
export const INVALIDATE_CACHE = 'layer/INVALIDATE_CACHE';
const UPDATE_PROGRESS = 'layer/UPDATE_PROGRESS';

const IMPORT_LAYER_REQUEST = 'layers/IMPORT_LAYER_REQUEST';
const IMPORT_LAYER_COMMIT = 'layers/IMPORT_LAYER_COMMIT';
const IMPORT_LAYER_ROLLBACK = 'layers/IMPORT_LAYER_ROLLBACK';

const IMPORTED_LAYERS_DIRECTORY = 'imported layers';

// Reducer
const initialState = {
  data: [],
  synced: false,
  syncing: false,
  activeLayer: null,
  syncDate: Date.now(),
  layersProgress: {}, // saves the progress relative to each area's layer
  cacheStatus: {}, // status of the current area cache
  cache: {}, // save the layers path for each area
  pendingCache: {}, // key value with layer => areaId to cache
  importError: null,
  imported: [],
  importingLayer: null // file path for layer which is being imported
};

export default function reducer(state: LayersState = initialState, action: LayersAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { layers }: State = action.payload;
      const cacheStatus = !layers
        ? {}
        : Object.entries(layers.cacheStatus).reduce((acc, [areaId, status]) => {
            // $FlowFixMe
            const progress = status.progress;
            // $FlowFixMe
            if (progress < 1 && !status.completed && status.requested) {
              return {
                ...acc,
                [areaId]: {
                  progress,
                  requested: false,
                  completed: false,
                  error: false
                }
              };
            }
            return { ...acc, [areaId]: status };
          }, {});
      return {
        ...state,
        ...layers,
        cacheStatus,
        synced: false,
        syncing: false,
        pendingCache: {}
      };
    }
    case GET_LAYERS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_LAYERS_COMMIT: {
      const areas = [...action.meta.areas];
      const layers = [...action.payload];
      const syncDate = Date.now();
      const cacheStatus = getCacheStatusFromAreas(state.cacheStatus, areas);

      return { ...state, data: layers, cacheStatus, syncDate, synced: true, syncing: false };
    }
    case GET_LAYERS_ROLLBACK: {
      return { ...state, syncing: false };
    }
    case DOWNLOAD_AREA: {
      const area = action.payload;
      const { data, cache } = state;
      let pendingCache = { ...state.pendingCache };
      let cacheStatus = { ...state.cacheStatus };

      const layers = getLayersWithBasemap(data);

      layers.forEach(layer => {
        if (!cache[layer.id] || (cache[layer.id] && !cache[layer.id][area.id])) {
          pendingCache = {
            ...pendingCache,
            [layer.id]: {
              ...pendingCache[layer.id],
              [area.id]: false
            }
          };
        }
      });

      if (cacheStatus[area.id]) {
        cacheStatus = {
          ...cacheStatus,
          [area.id]: {
            ...cacheStatus[area.id],
            requested: true
          }
        };
      } else {
        cacheStatus = {
          ...cacheStatus,
          [area.id]: {
            progress: 0,
            completed: false,
            requested: true,
            error: false
          }
        };
      }
      return { ...state, pendingCache, cacheStatus };
    }
    case DELETE_AREA_COMMIT: {
      const { area } = action.meta;
      const cacheStatus = omit(state.cacheStatus, [area.id]);
      const layersProgress = omit(state.layersProgress, [area.id]);
      let cache = { ...state.cache };
      Object.keys(cache).forEach(layerId => {
        cache = {
          ...cache,
          [layerId]: omit(cache[layerId], [area.id])
        };
      });
      removeFolder(`${CONSTANTS.files.tiles}/${area.id}`).then(() =>
        console.info(`Area ${area.id} cache deleted successfully`)
      );
      return { ...state, cache, cacheStatus, layersProgress };
    }
    case UPDATE_PROGRESS: {
      const { areaId, progress, layerId } = action.payload;
      const areaLayersProgress = state.layersProgress[areaId];
      const layersProgress = {
        ...state.layersProgress,
        [areaId]: {
          ...areaLayersProgress,
          [layerId]: progress
        }
      };
      const layerCount = getLayersWithBasemap(state.data).length;
      const cacheStatus = updateAreaProgress(areaId, state.cacheStatus, layersProgress, layerCount);

      return { ...state, cacheStatus, layersProgress };
    }
    case INVALIDATE_CACHE: {
      const areaId = action.payload;
      let cache = { ...state.cache };
      Object.keys(cache).forEach(layerId => {
        cache = {
          ...cache,
          [layerId]: omit(cache[layerId], [areaId])
        };
      });
      return { ...state, cache };
    }
    case SET_ACTIVE_LAYER:
      return { ...state, activeLayer: action.payload };
    case CACHE_LAYER_REQUEST: {
      const { area, layer } = action.payload;
      const pendingCache = {
        ...state.pendingCache,
        [layer.id]: {
          ...state.pendingCache[layer.id],
          [area.id]: true
        }
      };
      return { ...state, pendingCache };
    }
    case CACHE_LAYER_COMMIT: {
      const { area, layer } = action.meta;
      let path = action.payload;
      path = path && path.length > 0 ? path[0] : path;
      const pendingCache = {
        ...state.pendingCache,
        [layer.id]: omit(state.pendingCache[layer.id], [area.id])
      };
      const cache = {
        ...state.cache,
        [layer.id]: {
          ...state.cache[layer.id],
          [area.id]: path
        }
      };
      const layersProgress = {
        ...state.layersProgress,
        [area.id]: {
          ...state.layersProgress[area.id],
          [layer.id]: 1
        }
      };
      const layerCount = getLayersWithBasemap(state.data).length;
      const updatedCacheStatus = updateAreaProgress(area.id, state.cacheStatus, layersProgress, layerCount);
      const cacheStatus = updateCacheAreaStatus(updatedCacheStatus, area);

      return { ...state, cache, cacheStatus, pendingCache, layersProgress };
    }
    case CACHE_LAYER_ROLLBACK: {
      const { area, layer } = action.meta;
      const { cacheStatus } = state;
      const updatedCacheStatus = updateCacheAreaStatus(cacheStatus, area);
      const areaCacheStatus = { ...updatedCacheStatus[area.id], requested: false, error: true };
      const newCacheStatus = { ...updatedCacheStatus, [area.id]: { ...areaCacheStatus } };
      const pendingCache = {
        ...state.pendingCache,
        [layer.id]: omit(state.pendingCache[layer.id], [area.id])
      };
      const layersProgress = {
        ...state.layersProgress,
        [area.id]: {
          ...state.layersProgress[area.id],
          [layer.id]: 0
        }
      };
      return { ...state, pendingCache, cacheStatus: newCacheStatus, layersProgress };
    }
    case SET_CACHE_STATUS: {
      return { ...state, cacheStatus: action.payload };
    }
    case SAVE_AREA_COMMIT: {
      const { cacheStatus } = state;
      const area = action.payload;
      const newCacheStatus = updateCacheAreaStatus(cacheStatus, area);
      return { ...state, cacheStatus: newCacheStatus };
    }
    case IMPORT_LAYER_COMMIT: {
      const importedLayers = [...state.imported];
      importedLayers.push(action.payload);
      return { ...state, importingLayer: null, importError: null, imported: importedLayers };
    }
    case IMPORT_LAYER_REQUEST: {
      return { ...state, importingLayer: action.payload, importError: null };
    }
    case IMPORT_LAYER_ROLLBACK: {
      return { ...state, importingLayer: null, importError: action.payload };
    }
    case LOGOUT_REQUEST:
      removeFolder(CONSTANTS.files.tiles).then(console.info('Folder removed successfully'));
      return initialState;
    default:
      return state;
  }
}

export function getUserLayers() {
  return (dispatch: Dispatch, state: GetState) => {
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

export function setActiveContextualLayer(layerId: string, value: boolean) {
  return (dispatch: Dispatch, getState: GetState) => {
    let activeLayer = null;
    const state = getState();
    const currentActiveLayerId = state.layers.activeLayer;
    const currentActiveLayer = state.layers.data?.find(layerData => layerData.id === currentActiveLayerId);
    if (!value) {
      if (currentActiveLayer) {
        tracker.trackLayerToggledEvent(currentActiveLayer.name, false);
      }
    } else if (layerId !== currentActiveLayerId) {
      if (currentActiveLayer) {
        tracker.trackLayerToggledEvent(currentActiveLayer.name, false);
      }
      activeLayer = layerId;
      const nextActiveLayer = state.layers.data?.find(layerData => layerData.id === layerId);
      if (nextActiveLayer) {
        tracker.trackLayerToggledEvent(nextActiveLayer.name, true);
      }
    }
    return dispatch({ type: SET_ACTIVE_LAYER, payload: activeLayer });
  };
}

async function downloadLayer(config, dispatch: Dispatch) {
  const { area, layerId, layerUrl, zoom } = config;
  const url = `${Config.API_URL}/download-tiles/${area.geostore.id}/${zoom.start}/${
    zoom.end
  }?layerUrl=${layerUrl}&useExtension=false`;
  const res = await RNFetchBlob.config({ fileCache: true })
    .fetch('GET', encodeURI(url))
    .progress((received, total) => {
      const progress = received / total;
      dispatch({ type: UPDATE_PROGRESS, payload: { areaId: area.id, progress, layerId } });
    });
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

function downloadAllLayers(config: { area: Area, layerId: string, layerUrl: string }, dispatch: Dispatch) {
  const { cacheZoom } = CONSTANTS.maps;
  return Promise.all(
    cacheZoom.map(cacheLevel => {
      const layerConfig = { ...config, zoom: cacheLevel };
      return downloadLayer(layerConfig, dispatch);
    })
  );
}

export function importContextualLayer(file: File) {
  return async (dispatch: Dispatch, state: GetState) => {
    const fileName = file.uri.substring(file.uri.lastIndexOf('/') + 1);

    dispatch({ type: IMPORT_LAYER_REQUEST, payload: file.uri });

    //TODO: remove, this is just for testing!
    // await RNFS.unlink(RNFS.DocumentDirectoryPath + '/' + IMPORTED_LAYERS_DIRECTORY + '/' + fileName)

    // Set these up as constants
    const directory = RNFS.DocumentDirectoryPath + '/' + IMPORTED_LAYERS_DIRECTORY;

    switch (file.type) {
      case 'text/plain':
      case 'application/json':
      case 'application/geo+json':
        try {
          // Make the directory for saving files to, if this is already present this won't error according to docs
          const path = directory + '/' + fileName;
          await RNFS.mkdir(directory, {
            NSURLIsExcludedFromBackupKey: false // Allow this to be saved to iCloud backup!
          });
          // Copy the file to the app's storage
          await RNFS.copyFile(file.uri, path);
          dispatch({ type: IMPORT_LAYER_COMMIT, payload: { ...file, uri: path, name: fileName } });
        } catch (err) {
          dispatch({ type: IMPORT_LAYER_ROLLBACK, payload: err });
        }
        break;
      case 'application/gpx+xml':
        try {
          // Change destination file path extension!
          const newName = fileName.replace(/\.[^/.]+$/, ".geojson");
          const path = directory + '/' + newName;
          // Read from file so we can convert to GeoJSON
          let fileContents = await RNFS.readFile(file.uri);
          // Parse XML from file string
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(fileContents);
          // Convert to GeoJSON using mapbox's library!
          const geoJSON = togeojson.gpx(xmlDoc, { styles: true });
          // Write the new data to the app's storage
          await RNFS.writeFile(path, JSON.stringify(geoJSON));
          dispatch({ type: IMPORT_LAYER_COMMIT, payload: { ...file, type: "application/geo+json", uri: path, name: newName } });
        } catch (err) {
          dispatch({ type: IMPORT_LAYER_ROLLBACK, payload: err });
        }
      default:
        //todo: Add support for other file types! These need converting to geojson before saving.
        break;
    }
  };
}

function getAreaById(areas, areaId) {
  const area = areas.find(areaData => areaData.id === areaId);
  return area ? { ...area } : null;
}

function getLayerById(layers, layerId) {
  if (!layers) {
    return null;
  }
  const layer = layers.find(layerData => layerData.id === layerId);
  return layer ? { ...layer } : null;
}

export function cacheAreaBasemap(areaId: string) {
  return (dispatch: Dispatch, state: GetState) => {
    const areas = state().areas.data;
    const area = getAreaById(areas, areaId);
    const layer = {
      id: 'basemap',
      url: CONSTANTS.maps.basemap
    };
    if (area) {
      const downloadConfig = {
        area,
        layerId: layer.id,
        layerUrl: layer.url
      };

      downloadAllLayers(downloadConfig, dispatch)
        .then(payload =>
          dispatch({
            payload,
            meta: { area, layer },
            type: CACHE_LAYER_COMMIT
          })
        )
        .catch(() =>
          dispatch({
            meta: { area, layer },
            type: CACHE_LAYER_ROLLBACK
          })
        );
      dispatch({ type: CACHE_LAYER_REQUEST, payload: { area, layer } });
    }
  };
}

export function cacheAreaLayer(areaId: string, layerId: string) {
  return (dispatch: Dispatch, state: GetState) => {
    const areas = state().areas.data;
    const area = getAreaById(areas, areaId);
    const layer = getLayerById(state().layers.data, layerId);
    if (area && layer) {
      const downloadConfig = {
        area,
        layerId: layer.id,
        layerUrl: layer.url
      };
      downloadAllLayers(downloadConfig, dispatch)
        .then(payload =>
          dispatch({
            payload,
            meta: { area, layer },
            type: CACHE_LAYER_COMMIT
          })
        )
        .catch(() =>
          dispatch({
            meta: { area, layer },
            type: CACHE_LAYER_ROLLBACK
          })
        );
      dispatch({ type: CACHE_LAYER_REQUEST, payload: { area, layer } });
    }
  };
}

export function syncLayers() {
  return (dispatch: Dispatch, state: GetState) => {
    const { synced, syncing } = state().layers;
    if (!synced && !syncing) {
      dispatch(getUserLayers());
    }
  };
}

export function downloadAreaById(areaId: string) {
  return (dispatch: Dispatch, state: GetState) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      dispatch({
        type: DOWNLOAD_AREA,
        payload: area
      });
      dispatch(cacheLayers());
    }
  };
}

export function refreshAreaCacheById(areaId: string) {
  return (dispatch: Dispatch) => {
    dispatch({ type: INVALIDATE_CACHE, payload: areaId });
    dispatch(downloadAreaById(areaId));
  };
}

export function cacheLayers() {
  return (dispatch: Dispatch, state: GetState) => {
    const { pendingCache } = state().layers;
    if (getActionsTodoCount(pendingCache) > 0) {
      Object.keys(pendingCache).forEach(layer => {
        const syncingLayersData = pendingCache[layer];
        const canDispatch = id => typeof syncingLayersData[id] !== 'undefined' && syncingLayersData[id] === false;
        const syncLayersData = action => {
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

function getCacheStatusFromAreas(cacheStatus: LayersCacheStatus = {}, areas = []) {
  return areas.reduce((acc, next) => updateCacheAreaStatus(acc, next), cacheStatus);
}

function updateCacheAreaStatus(cacheStatus: LayersCacheStatus, area: Area) {
  const progress = cacheStatus[area.id] ? cacheStatus[area.id].progress : 0;
  const error = cacheStatus[area.id] ? cacheStatus[area.id].error : false;
  return {
    ...cacheStatus,
    [area.id]: {
      error,
      progress,
      completed: progress === 1,
      requested: cacheStatus[area.id] ? cacheStatus[area.id].requested : false
    }
  };
}

export function resetCacheStatus(areaId: string) {
  return (dispatch: Dispatch, state: GetState) => {
    const { cacheStatus } = state().layers;
    const newCacheStatus = {
      ...cacheStatus,
      [areaId]: {
        requested: false,
        completed: false,
        progress: 0,
        error: false
      }
    };
    dispatch({
      type: SET_CACHE_STATUS,
      payload: newCacheStatus
    });
  };
}

function getLayersWithBasemap(layers) {
  return [{ id: 'basemap' }, ...layers];
}

function updateAreaProgress(
  areaId: string = '',
  cacheStatus: LayersCacheStatus = {},
  layersProgress: LayersProgress = {},
  layerCount: number = 1
) {
  if (!areaId || typeof areaId !== 'string') {
    throw new TypeError('AreaId is not a valid string');
  }
  const areaCacheStatus = cacheStatus[areaId];
  const areaLayersProgress = Object.values(layersProgress[areaId]);
  const newProgress = areaLayersProgress.reduce((acc, next) => acc + parseFloat(next), 0) / layerCount;
  return {
    ...cacheStatus,
    [areaId]: {
      ...areaCacheStatus,
      progress: newProgress
    }
  };
}
