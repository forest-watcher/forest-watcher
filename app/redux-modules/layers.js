// @flow
import type { ContextualLayer, LayersState, LayersAction, LayersCacheStatus, LayersProgress } from 'types/layers.types';
import type { Dispatch, GetState, State, Thunk } from 'types/store.types';
import type { Area } from 'types/areas.types';
import type { File } from 'types/file.types';
import type { LayerFile, LayerType } from 'types/sharing.types';

import Config from 'react-native-config';
import omit from 'lodash/omit';
import CONSTANTS, { GFW_BASEMAPS } from 'config/constants';
import { getActionsTodoCount } from 'helpers/sync';

import { LOGOUT_REQUEST } from 'redux-modules/user';
import { SAVE_AREA_COMMIT, DELETE_AREA_COMMIT } from 'redux-modules/areas';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

import tracker from 'helpers/googleAnalytics';
import { storeTilesFromUrl } from 'helpers/layer-store/storeLayerFiles';
import deleteLayerFiles from 'helpers/layer-store/deleteLayerFiles';

import { importLayerFile } from 'helpers/layer-store/import/importLayerFile';
import MapboxGL from '@react-native-mapbox-gl/maps';

const GET_LAYERS_REQUEST = 'layers/GET_LAYERS_REQUEST';
const GET_LAYERS_COMMIT = 'layers/GET_LAYERS_COMMIT';
const GET_LAYERS_ROLLBACK = 'layers/GET_LAYERS_ROLLBACK';
const SET_ACTIVE_LAYER = 'layers/SET_ACTIVE_LAYER';
const DOWNLOAD_AREA = 'layers/DOWNLOAD_AREA';
const CACHE_LAYER_REQUEST = 'layers/CACHE_LAYER_REQUEST';
const CACHE_LAYER_COMMIT = 'layers/CACHE_LAYER_COMMIT';
export const CACHE_LAYER_ROLLBACK = 'layers/CACHE_LAYER_ROLLBACK';
const SET_CACHE_STATUS = 'layers/SET_CACHE_STATUS';
export const INVALIDATE_CACHE = 'layers/INVALIDATE_CACHE';
const UPDATE_PROGRESS = 'layers/UPDATE_PROGRESS';

export const IMPORT_LAYER_REQUEST = 'layers/IMPORT_LAYER_REQUEST';
export const IMPORT_LAYER_COMMIT = 'layers/IMPORT_LAYER_COMMIT';
const IMPORT_LAYER_CLEAR = 'layers/IMPORT_LAYER_CLEAR';
const IMPORT_LAYER_ROLLBACK = 'layers/IMPORT_LAYER_ROLLBACK';
const RENAME_LAYER = 'layers/RENAME_LAYER';
const DELETE_LAYER = 'layers/DELETE_LAYER';

const MAPBOX_DOWNLOAD_COMPLETED_STATE = 2;

// Reducer
const initialState: LayersState = {
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
  importingLayer: false // whether a layer is currently being imported.
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
      const { area, basemaps } = action.payload;
      const { data, cache } = state;
      let pendingCache = { ...state.pendingCache };
      let cacheStatus = { ...state.cacheStatus };

      // add contextual layers to pendingCache
      data.forEach(layer => {
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

      // add basemaps to pendingCache
      basemaps.forEach(layer => {
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
      // TODO: Delete tiles after layer is deleted
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
      const layerCount = getDownloadableLayerCount(state.data);
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
      const { areaId, layerId } = action.payload;
      const pendingCache = {
        ...state.pendingCache,
        [layerId]: {
          ...state.pendingCache[layerId],
          [areaId]: true
        }
      };
      return { ...state, pendingCache };
    }
    case CACHE_LAYER_COMMIT: {
      const { areaId, layerId, path } = action.payload;
      const pendingCache = {
        ...state.pendingCache,
        [layerId]: omit(state.pendingCache[layerId], [areaId])
      };
      const layersProgress = {
        ...state.layersProgress,
        [areaId]: {
          ...state.layersProgress[areaId],
          [layerId]: 1
        }
      };
      const layerCount = getDownloadableLayerCount(state.data);
      const updatedCacheStatus = updateAreaProgress(areaId, state.cacheStatus, layersProgress, layerCount);
      const cacheStatus = updateCacheAreaStatus(updatedCacheStatus, areaId);

      if (!path) {
        return { ...state, cacheStatus, pendingCache, layersProgress };
      }
      const resolvedPath = path && path.length > 0 ? path[0] : path;
      const cache = {
        ...state.cache,
        [layerId]: {
          ...state.cache[layerId],
          [areaId]: resolvedPath
        }
      };
      return { ...state, cacheStatus, pendingCache, layersProgress, cache };
    }
    case CACHE_LAYER_ROLLBACK: {
      const { areaId, layerId } = action.payload;
      const { cacheStatus } = state;
      const updatedCacheStatus = updateCacheAreaStatus(cacheStatus, areaId);
      const areaCacheStatus = { ...updatedCacheStatus[areaId], requested: false, error: true };
      const newCacheStatus = { ...updatedCacheStatus, [areaId]: { ...areaCacheStatus } };
      const pendingCache = {
        ...state.pendingCache,
        [layerId]: omit(state.pendingCache[layerId], [areaId])
      };
      const layersProgress = {
        ...state.layersProgress,
        [areaId]: {
          ...state.layersProgress[areaId],
          [layerId]: 0
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
      const newCacheStatus = updateCacheAreaStatus(cacheStatus, area.id);
      return { ...state, cacheStatus: newCacheStatus };
    }
    case IMPORT_LAYER_CLEAR: {
      return { ...state, importingLayer: null, importError: null };
    }
    case IMPORT_LAYER_COMMIT: {
      const layerToSave = action.payload;
      // Ignore the saved layer if it already exists - this could happen when importing a layer for example
      const possiblyPreexistingLayer = state.imported.find(layer => layer.id === layerToSave.id);
      if (possiblyPreexistingLayer) {
        console.warn('3SC', `Ignore already existing layer with ID ${layerToSave.id}`);
        return state;
      }
      return { ...state, importingLayer: false, importError: null, imported: [...state.imported, layerToSave] };
    }
    case IMPORT_LAYER_REQUEST: {
      return { ...state, importingLayer: true, importError: null };
    }
    case IMPORT_LAYER_ROLLBACK: {
      return { ...state, importingLayer: false, importError: action.payload };
    }
    case RENAME_LAYER: {
      let layers = state.imported;
      const layer = layers.filter(layer => layer.id === action.payload.id)?.[0];

      if (!layer) {
        return state;
      }

      layer.name = action.payload.name;
      layers = layers.filter(layer => layer.id !== action.payload.id);
      layers.push(layer);

      return { ...state, imported: layers };
    }
    case DELETE_LAYER: {
      const layers = state.imported.filter(layer => layer.id !== action.payload);
      const activeLayer = state.activeLayer === action.payload ? null : state.activeLayer;

      return { ...state, imported: layers, activeLayer: activeLayer };
    }
    case LOGOUT_REQUEST:
      deleteLayerFiles().then(console.info('Folder removed successfully'));
      return initialState;
    default:
      return state;
  }
}

export function renameLayer(id: string, name: string): LayersAction {
  return {
    type: RENAME_LAYER,
    payload: {
      id,
      name
    }
  };
}

export function deleteLayer(id: string): LayersAction {
  return {
    type: DELETE_LAYER,
    payload: id
  };
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
    const currentActiveLayer: ?ContextualLayer = state.layers.data?.find(
      layerData => layerData.id === currentActiveLayerId
    );
    if (!value) {
      if (currentActiveLayer) {
        tracker.trackLayerToggledEvent(currentActiveLayer.name, false);
      }
    } else if (layerId !== currentActiveLayerId) {
      if (currentActiveLayer) {
        tracker.trackLayerToggledEvent(currentActiveLayer.name, false);
      }
      activeLayer = layerId;
      const nextActiveLayer: ?ContextualLayer = state.layers.data?.find(layerData => layerData.id === layerId);
      if (nextActiveLayer) {
        tracker.trackLayerToggledEvent(nextActiveLayer.name, true);
      }
    }
    return dispatch({ type: SET_ACTIVE_LAYER, payload: activeLayer });
  };
}

async function downloadLayer(layerType: LayerType, config, dispatch: Dispatch): Promise<string> {
  const { area, layerId, layerUrl, zoom } = config;
  return await storeTilesFromUrl(
    layerType,
    layerId,
    layerUrl,
    area.geostore?.id,
    [zoom.start, zoom.end],
    (received, total) => {
      const progress = received / total;
      dispatch({ type: UPDATE_PROGRESS, payload: { areaId: area.id, progress, layerId } });
    }
  );
}

function downloadAllLayers(
  layerType: LayerType,
  config: { area: Area, layerId: string, layerUrl: string },
  dispatch: Dispatch
) {
  const { cacheZoom } = CONSTANTS.maps;
  return Promise.all(
    cacheZoom.map(cacheLevel => {
      const layerConfig = { ...config, zoom: cacheLevel };
      return downloadLayer(layerType, layerConfig, dispatch);
    })
  );
}

export function clearImportContextualLayerState(): LayersAction {
  return {
    type: IMPORT_LAYER_CLEAR
  };
}

export function importContextualLayer(layerFile: File): Thunk<Promise<void>> {
  return async (dispatch: Dispatch, state: GetState) => {
    dispatch({ type: IMPORT_LAYER_REQUEST });

    try {
      const importedFile: LayerFile = await importLayerFile(layerFile);
      const layerData: ContextualLayer = {
        enabled: true,
        id: layerFile.id,
        isPublic: false,
        name: layerFile.name || '',
        url: `${importedFile.path}/${importedFile.subFiles[0]}`,
        size: importedFile.size
      };
      dispatch({
        type: IMPORT_LAYER_COMMIT,
        payload: layerData
      });
    } catch (err) {
      // Fire and forget!
      dispatch({ type: IMPORT_LAYER_ROLLBACK, payload: err });
      throw err;
    }
  };
}

function getAreaById(areas, areaId): ?Area {
  const area = areas.find(areaData => areaData.id === areaId);
  return area ? { ...area } : null;
}

function getLayerById(layers, layerId): ?ContextualLayer {
  if (!layers) {
    return null;
  }
  const layer = layers.find(layerData => layerData.id === layerId);
  return layer ? { ...layer } : null;
}

export function cacheAreaBasemap(areaId: string, basemapId: string) {
  return async (dispatch: Dispatch, state: GetState) => {
    const packName = `${areaId}|${basemapId}`;
    const pack = await MapboxGL.offlineManager.getPack(packName);
    if (pack) {
      // offline pack with with this id already exists. Can ignore or delete and redownload pack.
      console.warn('3SC', 'Error: offline pack with with this id already exists');
      return;
    }
    const areaBbox = state().areas.data.find(area => area.id === areaId)?.geostore?.bbox;
    if (!areaBbox) {
      return;
    }
    const areaBounds = [[areaBbox[2], areaBbox[3]], [areaBbox[0], areaBbox[1]]];
    const progressListener = (offlineRegion, status) => {
      if (!status.percentage) {
        return;
      }
      dispatch({
        type: UPDATE_PROGRESS,
        payload: { areaId: areaId, progress: status.percentage / 100, layerId: basemapId }
      });
      if (status.state === MAPBOX_DOWNLOAD_COMPLETED_STATE) {
        dispatch({ type: CACHE_LAYER_COMMIT, payload: { areaId, layerId: basemapId } });
      }
    };
    const errorListener = (offlineRegion, err) => {
      dispatch({ type: CACHE_LAYER_ROLLBACK, payload: { areaId, layerId: basemapId } });
      console.error('3SC download basemap error: ', err);
    };
    const downloadPackOptions = {
      name: packName,
      styleURL: basemapId,
      minZoom: 1,
      maxZoom: CONSTANTS.maps.cacheZoom[0].end,
      bounds: areaBounds
    };

    try {
      dispatch({ type: CACHE_LAYER_REQUEST, payload: { areaId, layerId: basemapId } });
      await MapboxGL.offlineManager.createPack(downloadPackOptions, progressListener, errorListener);
    } catch (error) {
      console.error('3SC basemap download error: ', error);
      dispatch({ type: CACHE_LAYER_ROLLBACK, payload: { areaId, layerId: basemapId } });
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
      downloadAllLayers('contextual_layer', downloadConfig, dispatch)
        .then(path => dispatch({ type: CACHE_LAYER_COMMIT, payload: { path, areaId, layerId } }))
        .catch(() => dispatch({ type: CACHE_LAYER_ROLLBACK, payload: { areaId, layerId } }));
      dispatch({ type: CACHE_LAYER_REQUEST, payload: { areaId, layerId } });
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
    // we can't download basemaps with tile urls
    const basemaps = GFW_BASEMAPS.filter(basemap => !basemap.tileUrl);
    if (area) {
      dispatch({
        type: DOWNLOAD_AREA,
        payload: {
          area,
          basemaps
        }
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
        if (layer.startsWith('mapbox://')) {
          syncLayersData(id => dispatch(cacheAreaBasemap(id, layer)));
        } else {
          syncLayersData(id => dispatch(cacheAreaLayer(id, layer)));
        }
      });
    }
  };
}

function getCacheStatusFromAreas(cacheStatus: LayersCacheStatus = {}, areas = []) {
  return areas.reduce((acc, next) => updateCacheAreaStatus(acc, next.id), cacheStatus);
}

function updateCacheAreaStatus(cacheStatus: LayersCacheStatus, areaId: string) {
  const progress = cacheStatus[areaId] ? cacheStatus[areaId].progress : 0;
  const error = cacheStatus[areaId] ? cacheStatus[areaId].error : false;
  return {
    ...cacheStatus,
    [areaId]: {
      error,
      progress,
      completed: progress === 1,
      requested: cacheStatus[areaId] ? cacheStatus[areaId].requested : false
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

export function getImportedContextualLayersById(layerIds: Array<string>) {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    return [...state.layers.imported].filter(layer => {
      return layerIds.includes(layer.id);
    });
  };
}

// Return the amount of contextual layers and basemaps that can be downloaded
function getDownloadableLayerCount(layers) {
  return [...layers, ...GFW_BASEMAPS.filter(basemap => !basemap.tileUrl)].length;
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
