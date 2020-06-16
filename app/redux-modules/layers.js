// @flow
import type {
  ContextualLayer,
  LayersState,
  LayersAction,
  LayersCacheStatus,
  LayersProgress,
  UpdateProgressActionType
} from 'types/layers.types';
import type { Dispatch, GetState, State, Thunk } from 'types/store.types';
import type { Area } from 'types/areas.types';
import type { Basemap } from 'types/basemaps.types';
import type { File } from 'types/file.types';
import type { Route } from 'types/routes.types';
import type { DownloadDataType, LayerFile, LayerType } from 'types/sharing.types';
import type { BBox2d } from '@turf/helpers';

import Config from 'react-native-config';
import omit from 'lodash/omit';
import CONSTANTS, { GFW_BASEMAPS } from 'config/constants';
import { bboxForRoute } from 'helpers/bbox';
import { downloadOfflinePack, getMapboxOfflinePack, nameForMapboxOfflinePack } from 'helpers/mapbox';
import { getActionsTodoCount } from 'helpers/sync';

import { LOGOUT_REQUEST } from 'redux-modules/user';
import { SAVE_AREA_COMMIT, DELETE_AREA_COMMIT } from 'redux-modules/areas';
import {
  IMPORT_BASEMAP_REQUEST,
  IMPORT_BASEMAP_PROGRESS,
  IMPORT_BASEMAP_AREA_COMPLETED,
  IMPORT_BASEMAP_COMMIT
} from 'redux-modules/basemaps';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

import {
  trackLayersToggled,
  trackDownloadedContent,
  trackContentDownloadStarted,
  trackImportedContent
} from 'helpers/analytics';
import { storeTilesFromUrl } from 'helpers/layer-store/storeLayerFiles';
import deleteLayerFiles from 'helpers/layer-store/deleteLayerFiles';

import { importLayerFile } from 'helpers/layer-store/import/importLayerFile';

const GET_LAYERS_REQUEST = 'layers/GET_LAYERS_REQUEST';
const GET_LAYERS_COMMIT = 'layers/GET_LAYERS_COMMIT';
const GET_LAYERS_ROLLBACK = 'layers/GET_LAYERS_ROLLBACK';
const SET_ACTIVE_LAYER = 'layers/SET_ACTIVE_LAYER';
const DOWNLOAD_DATA = 'layers/DOWNLOAD_DATA';
const CACHE_LAYER_REQUEST = 'layers/CACHE_LAYER_REQUEST';
const CACHE_LAYER_COMMIT = 'layers/CACHE_LAYER_COMMIT';
export const CACHE_LAYER_ROLLBACK = 'layers/CACHE_LAYER_ROLLBACK';
const SET_CACHE_STATUS = 'layers/SET_CACHE_STATUS';
export const INVALIDATE_CACHE = 'layers/INVALIDATE_CACHE';
const UPDATE_PROGRESS = 'layers/UPDATE_PROGRESS';

export const IMPORT_LAYER_REQUEST = 'layers/IMPORT_LAYER_REQUEST';
export const IMPORT_LAYER_PROGRESS = 'layers/IMPORT_LAYER_PROGRESS';
export const IMPORT_LAYER_AREA_COMPLETED = 'layers/IMPORT_LAYER_AREA_COMPLETED';
export const IMPORT_LAYER_COMMIT = 'layers/IMPORT_LAYER_COMMIT';

const IMPORT_LAYER_CLEAR = 'layers/IMPORT_LAYER_CLEAR';
const IMPORT_LAYER_ROLLBACK = 'layers/IMPORT_LAYER_ROLLBACK';
const RENAME_LAYER = 'layers/RENAME_LAYER';
const DELETE_LAYER = 'layers/DELETE_LAYER';

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
  importingLayer: false, // whether a layer is currently being imported.
  downloadedLayerProgress: {} // saves the progress relative to each layer, for every area being downloaded.
};

export default function reducer(state: LayersState = initialState, action: LayersAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { layers }: State = action.payload;
      const cacheStatus = !layers
        ? {}
        : Object.entries(layers.cacheStatus).reduce((acc, [id, status]) => {
            // $FlowFixMe
            const progress = status.progress;
            // $FlowFixMe
            if (progress < 1 && !status.completed && status.requested) {
              return {
                ...acc,
                [id]: {
                  progress,
                  requested: false,
                  completed: false,
                  error: false
                }
              };
            }
            return { ...acc, [id]: status };
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
    case DOWNLOAD_DATA: {
      const { dataId, basemaps } = action.payload;
      const { data, cache } = state;
      let pendingCache = { ...state.pendingCache };
      let cacheStatus = { ...state.cacheStatus };

      // add contextual layers to pendingCache
      data.forEach(layer => {
        if (!cache[layer.id] || (cache[layer.id] && !cache[layer.id][dataId])) {
          pendingCache = {
            ...pendingCache,
            [layer.id]: {
              ...pendingCache[layer.id],
              [dataId]: false
            }
          };
        }
      });

      // add basemaps to pendingCache
      basemaps.forEach(layer => {
        if (!cache[layer.id] || (cache[layer.id] && !cache[layer.id][dataId])) {
          pendingCache = {
            ...pendingCache,
            [layer.id]: {
              ...pendingCache[layer.id],
              [dataId]: false
            }
          };
        }
      });

      if (cacheStatus[dataId]) {
        cacheStatus = {
          ...cacheStatus,
          [dataId]: {
            ...cacheStatus[dataId],
            requested: true
          }
        };
      } else {
        cacheStatus = {
          ...cacheStatus,
          [dataId]: {
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
      const { id, progress, layerId } = action.payload;
      const areaLayersProgress = state.layersProgress[id];
      const layersProgress = {
        ...state.layersProgress,
        [id]: {
          ...areaLayersProgress,
          [layerId]: progress
        }
      };
      const layerCount = getDownloadableLayerCount(state.data);
      const cacheStatus = updateDataProgress(id, state.cacheStatus, layersProgress, layerCount);

      return { ...state, cacheStatus, layersProgress };
    }
    case INVALIDATE_CACHE: {
      const id = action.payload;
      let cache = { ...state.cache };
      Object.keys(cache).forEach(layerId => {
        cache = {
          ...cache,
          [layerId]: omit(cache[layerId], [id])
        };
      });
      return { ...state, cache };
    }
    case SET_ACTIVE_LAYER:
      return { ...state, activeLayer: action.payload };
    case CACHE_LAYER_REQUEST: {
      const { dataId, layerId } = action.payload;
      const pendingCache = {
        ...state.pendingCache,
        [layerId]: {
          ...state.pendingCache[layerId],
          [dataId]: true
        }
      };
      return { ...state, pendingCache };
    }
    case CACHE_LAYER_COMMIT: {
      const { dataId, layerId, path } = action.payload;
      const pendingCache = {
        ...state.pendingCache,
        [layerId]: omit(state.pendingCache[layerId], [dataId])
      };
      const layersProgress = {
        ...state.layersProgress,
        [dataId]: {
          ...state.layersProgress[dataId],
          [layerId]: 1
        }
      };
      const layerCount = getDownloadableLayerCount(state.data);
      const updatedCacheStatus = updateDataProgress(dataId, state.cacheStatus, layersProgress, layerCount);
      const cacheStatus = updateCachedDataStatus(updatedCacheStatus, dataId);

      if (!path) {
        return { ...state, cacheStatus, pendingCache, layersProgress };
      }
      const resolvedPath = path && path.length > 0 ? path[0] : path;
      const cache = {
        ...state.cache,
        [layerId]: {
          ...state.cache[layerId],
          [dataId]: resolvedPath
        }
      };
      return { ...state, cacheStatus, pendingCache, layersProgress, cache };
    }
    case CACHE_LAYER_ROLLBACK: {
      const { dataId, layerId } = action.payload;
      const { cacheStatus } = state;
      const updatedCacheStatus = updateCachedDataStatus(cacheStatus, dataId);
      const areaCacheStatus = { ...updatedCacheStatus[dataId], requested: false, error: true };
      const newCacheStatus = { ...updatedCacheStatus, [dataId]: { ...areaCacheStatus } };
      const pendingCache = {
        ...state.pendingCache,
        [layerId]: omit(state.pendingCache[layerId], [dataId])
      };
      const layersProgress = {
        ...state.layersProgress,
        [dataId]: {
          ...state.layersProgress[dataId],
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
      const newCacheStatus = updateCachedDataStatus(cacheStatus, area.id);
      return { ...state, cacheStatus: newCacheStatus };
    }
    case IMPORT_LAYER_CLEAR: {
      return { ...state, importingLayer: null, importError: null };
    }
    case IMPORT_LAYER_COMMIT: {
      const layerToSave = action.payload;
      let importedLayers = [...state.imported];

      if (importedLayers.find(layer => layer.id === layerToSave.id)) {
        // This layer already exists in redux, replace the existing entry with the new one.
        importedLayers = importedLayers.map(layer => (layer.id === layerToSave.id ? layerToSave : layer));

        return { ...state, importingLayer: false, importError: null, imported: importedLayers };
      }

      return { ...state, importingLayer: false, importError: null, imported: [...importedLayers, layerToSave] };
    }
    case IMPORT_LAYER_REQUEST: {
      const updatedState = { ...state, importingLayer: true, importError: null };

      if (action.payload?.remote) {
        // This is a remote layer, we need to add this area into the layer's progress state so it can be tracked.
        const dataId = action.payload?.dataId;
        const layerId = action.payload?.layerId;

        if (!dataId || !layerId) {
          return updatedState;
        }

        // Within the downloadedLayerProgress state, within the layer-specific object, we mark the
        // given area as being downloaded.
        // We can then refer to this for download progress or to hold errors.
        const updatedStateWithProgress = {
          ...updatedState,
          downloadedLayerProgress: {
            ...updatedState.downloadedLayerProgress,
            [layerId]: {
              ...updatedState.downloadedLayerProgress[layerId],
              [dataId]: {
                requested: true,
                progress: 0,
                completed: false,
                error: false
              }
            }
          }
        };

        return updatedStateWithProgress;
      }
      return updatedState;
    }
    case IMPORT_LAYER_PROGRESS: {
      const { id, progress, layerId } = action.payload;

      const updatedStateWithProgress = {
        ...state,
        downloadedLayerProgress: {
          [layerId]: {
            ...state.downloadedLayerProgress[layerId],
            [id]: {
              ...state.downloadedLayerProgress[layerId]?.[id],
              progress
            }
          }
        }
      };

      return updatedStateWithProgress;
    }
    case IMPORT_LAYER_AREA_COMPLETED: {
      const { id, layerId, failed } = action.payload;

      // Mark the download as completed, with an error if one occurred.
      // We can then check for every request being completed, and if so the layer download can be concluded.
      return {
        ...state,
        downloadedLayerProgress: {
          ...state.downloadedLayerProgress,
          [layerId]: {
            ...state.downloadedLayerProgress[layerId],
            [id]: {
              requested: false,
              progress: 100,
              completed: true,
              error: failed
            }
          }
        }
      };
    }
    case IMPORT_LAYER_ROLLBACK: {
      // We do not use ROLLBACK for remote download errors - as a layer may complete for some of the requested areas.
      // Instead, we will commit the changes we have got, and then use the progress state to determine if errors occured.
      return {
        ...state,
        importingLayer: false,
        importError: action.payload
      };
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
      deleteLayerFiles().then(() => console.info('Folder removed successfully'));
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
        trackLayersToggled(currentActiveLayer.name, false);
      }
    } else if (layerId !== currentActiveLayerId) {
      if (currentActiveLayer) {
        trackLayersToggled(currentActiveLayer.name, false);
      }
      activeLayer = layerId;
      const nextActiveLayer: ?ContextualLayer = state.layers.data?.find(layerData => layerData.id === layerId);
      if (nextActiveLayer) {
        trackLayersToggled(nextActiveLayer.name, true);
      }
    }
    return dispatch({ type: SET_ACTIVE_LAYER, payload: activeLayer });
  };
}

async function downloadLayer(
  layerType: LayerType,
  config,
  dispatch: Dispatch,
  updateActionName: UpdateProgressActionType = UPDATE_PROGRESS
): Promise<string> {
  const { data, layerId, layerUrl, zoom } = config;
  return await storeTilesFromUrl(
    layerType,
    layerId,
    layerUrl,
    data.geostore?.id ?? data.geostoreId,
    [zoom.start, zoom.end],
    (received, total) => {
      const progress = received / total;
      dispatch({ type: updateActionName, payload: { id: data.id, progress, layerId } });
    }
  );
}

function downloadAllLayers(
  layerType: LayerType,
  config: { data: Area | Route, layerId: string, layerUrl: string },
  dispatch: Dispatch,
  updateActionName: UpdateProgressActionType = UPDATE_PROGRESS
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
      trackImportedContent('layer', layerFile.fileName, true, importedFile.size);
      dispatch({
        type: IMPORT_LAYER_COMMIT,
        payload: layerData
      });
    } catch (err) {
      // Fire and forget!
      dispatch({ type: IMPORT_LAYER_ROLLBACK, payload: err });
      trackImportedContent('layer', layerFile.fileName, false, layerFile.size);
      throw err;
    }
  };
}

/**
 * importGFWContent - downloads tiles for the given basemap/layer, for every currently available area.
 * @param {LayerType} contentType
 * @param {Basemap|ContextualLayer} content
 * @param {boolean} onlyNonDownloadedRegions - true if we wish to only request regions that have failed / haven't yet been attempted.
 */
export function importGFWContent(
  contentType: LayerType,
  content: Basemap | ContextualLayer,
  onlyNonDownloadedRegions: boolean = false,
  downloadContent: boolean = true
): Thunk<Promise<void>> {
  return async (dispatch: Dispatch, getState: GetState) => {
    if (!downloadContent) {
      // We're not downloading this content, so immediately commit it.
      const COMMIT_ACTION = contentType === 'contextual_layer' ? IMPORT_LAYER_COMMIT : IMPORT_BASEMAP_COMMIT;
      dispatch({ type: COMMIT_ACTION, payload: content });
      return;
    }

    const state = getState();

    const layerId = content.id;

    let regions = [...state.areas.data, ...state.routes.previousRoutes];

    if (onlyNonDownloadedRegions) {
      // We should only download non-downloaded regions, rather than refresh the entire cache.
      // We may do this when a new region has been created & we wish to download that new layer,
      // or when an error has occurred. Requesting all of the tiles again would be unnecessary.
      const layerProgress =
        contentType === 'contextual_layer'
          ? state.layers.downloadedLayerProgress[layerId]
          : state.basemaps.downloadedBasemapProgress[layerId];

      const completedRegions = Object.keys(layerProgress ?? {}).filter(regionKey => {
        const region = layerProgress[regionKey];
        return region.completed && !region.error;
      });
      regions = regions.filter(region => !completedRegions.includes(region.id));
    }

    const REQUEST_ACTION = contentType === 'contextual_layer' ? IMPORT_LAYER_REQUEST : IMPORT_BASEMAP_REQUEST;
    const PROGRESS_ACTION = contentType === 'contextual_layer' ? IMPORT_LAYER_PROGRESS : IMPORT_BASEMAP_PROGRESS;

    const url = contentType === 'contextual_layer' ? content.url : content.styleURL;

    if (!url) {
      return;
    }

    const regionPromises = regions.map(async region => {
      const dataId = region.id;
      if (url.startsWith('mapbox://')) {
        // This is a mapbox layer - we must use OfflineManager
        const name = nameForMapboxOfflinePack(dataId, layerId);
        const pack = await getMapboxOfflinePack(name);

        if (pack) {
          // offline pack with with this id already exists.
          console.info('3SC', 'Error: offline pack with with this id already exists');
          dispatch({
            type: PROGRESS_ACTION,
            payload: { id: dataId, progress: 100, layerId }
          });
          // We resolve this layer as completed successfully - as Mapbox will keep it up to date.
          dispatch(gfwContentImportCompleted(contentType, dataId, content));
          return;
        }

        let bbox: ?BBox2d = null;

        if (region.geostore?.bbox) {
          bbox = region.geostore?.bbox;
        } else {
          try {
            bbox = bboxForRoute(region);
          } catch {
            console.warn('3SC - Could not generate BBox for route - does it have two or more points?');
            dispatch({ type: CACHE_LAYER_COMMIT, payload: { dataId, layerId } });
            return;
          }
        }

        if (!bbox) {
          dispatch(gfwContentImportCompleted(contentType, dataId, content, true));
          return;
        }

        dispatch({ type: REQUEST_ACTION, payload: { dataId, layerId, remote: true } });

        try {
          await downloadOfflinePack(
            { name, url, minZoom: 1, maxZoom: CONSTANTS.maps.cacheZoom[0].end, bbox },
            (progress: number) => {
              dispatch({
                type: PROGRESS_ACTION,
                payload: { id: dataId, progress, layerId }
              });
            },
            (error: Error) => {
              dispatch(gfwContentImportCompleted(contentType, dataId, content, true));
            },
            () => {
              dispatch(gfwContentImportCompleted(contentType, dataId, content));
            }
          );
        } catch (error) {
          console.error('3SC layer download error: ', error);
          dispatch(gfwContentImportCompleted(contentType, dataId, content, true));
        }
      } else {
        dispatch({ type: REQUEST_ACTION, payload: { dataId, layerId, remote: true } });
        await downloadAllLayers(contentType, { data: region, layerId, layerUrl: url }, dispatch, PROGRESS_ACTION)
          .then(path => dispatch(gfwContentImportCompleted(contentType, region.id, content)))
          .catch(() => dispatch(gfwContentImportCompleted(contentType, region.id, content, true)));
      }
    });

    await Promise.all(regionPromises);
  };
}

/**
 * Called whenever a GFW basemap / contextual layer download has completed, even if it completed with an error.
 * This means we can resolve the area's progress state accordingly and track the download result.
 *
 * @param {LayerType} contentType
 * @param {string} dataId
 * @param {Basemap | ContextualLayer} layer
 * @param {boolean} withFailure
 */
function gfwContentImportCompleted(
  contentType: LayerType,
  dataId: string,
  layer: Basemap | ContextualLayer,
  withFailure: boolean = false
): Thunk<Promise<void>> {
  return async (dispatch: Dispatch, getState: GetState) => {
    const REGION_COMPLETE_ACTION =
      contentType === 'contextual_layer' ? IMPORT_LAYER_AREA_COMPLETED : IMPORT_BASEMAP_AREA_COMPLETED;
    const COMMIT_ACTION = contentType === 'contextual_layer' ? IMPORT_LAYER_COMMIT : IMPORT_BASEMAP_COMMIT;
    // We mark that region in the downloadedLayerProgress state as completed with 100% progress.
    // This means we can then keep track of regions that are still downloading / unpacking.
    await dispatch({
      type: REGION_COMPLETE_ACTION,
      payload: { id: dataId, layerId: layer.id, failed: withFailure }
    });

    // Check for any regions for this layer that are still in progress.
    const downloadProgressForLayer =
      contentType === 'contextual_layer'
        ? getState().layers.downloadedLayerProgress[layer.id]
        : getState().basemaps.downloadedBasemapProgress[layer.id] ?? {};
    const remainingRegions = Object.values(downloadProgressForLayer).filter(region => region.completed !== true);

    if (remainingRegions?.length === 0) {
      // The download has completed, and we can now commit the entire layer.
      // TODO: If an region has failed to download, should we show an alert to state this?

      // TODO: Get collective file size for all tiles, add it to the layer.
      dispatch({ type: COMMIT_ACTION, payload: layer });
    }
  };
}

function getAreaById(areas: Array<Area>, areaId: string): ?Area {
  const area = areas.find(areaData => areaData.id === areaId);
  return area ? { ...area } : null;
}

function getLayerById(layers: ?Array<ContextualLayer>, layerId): ?ContextualLayer {
  if (!layers) {
    return null;
  }

  const layer = layers.find(layerData => layerData.id === layerId);
  return layer ? { ...layer } : null;
}

function getRouteById(routes: Array<Route>, routeId: string): ?Route {
  const route = routes.find(route => route.id === routeId);
  return route ? { ...route } : null;
}

export function cacheAreaBasemap(dataType: DownloadDataType, dataId: string, basemapId: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const name = nameForMapboxOfflinePack(dataId, basemapId);
    const pack = await getMapboxOfflinePack(name);

    if (pack) {
      // offline pack with with this id already exists.
      console.info('3SC', 'Error: offline pack with with this id already exists');
      dispatch({
        type: UPDATE_PROGRESS,
        payload: { id: dataId, progress: 1, layerId: basemapId }
      });
      dispatch({ type: CACHE_LAYER_COMMIT, payload: { dataId, layerId: basemapId } });
      return;
    }

    const state = getState();
    let bbox: ?BBox2d = null;

    if (dataType === 'area') {
      bbox = state.areas.data.find(area => area.id === dataId)?.geostore?.bbox;
    } else {
      const route = state.routes.previousRoutes.find(route => route.id === dataId);

      if (route) {
        try {
          bbox = bboxForRoute(route);
        } catch {
          console.warn('3SC - Could not generate BBox for route - does it have two or more points?');
          dispatch({ type: CACHE_LAYER_COMMIT, payload: { dataId, layerId: basemapId } });
          return;
        }
      }
    }

    if (!bbox) {
      dispatch({ type: CACHE_LAYER_COMMIT, payload: { dataId, layerId: basemapId } });
      return;
    }

    trackContentDownloadStarted(name);
    dispatch({ type: CACHE_LAYER_REQUEST, payload: { dataId, layerId: basemapId } });
    try {
      await downloadOfflinePack(
        { name, url: basemapId, minZoom: 1, maxZoom: CONSTANTS.maps.cacheZoom[0].end, bbox },
        (progress: number) => {
          dispatch({
            type: UPDATE_PROGRESS,
            payload: { id: dataId, progress, layerId: basemapId }
          });
        },
        (error: Error) => {
          trackDownloadedContent('basemap', name, false);
          dispatch({ type: CACHE_LAYER_ROLLBACK, payload: { dataId, layerId: basemapId } });
        },
        () => {
          trackDownloadedContent('basemap', name, true);
          dispatch({ type: CACHE_LAYER_COMMIT, payload: { dataId, layerId: basemapId } });
        }
      );
    } catch (error) {
      console.error('3SC basemap download error: ', error);
      trackDownloadedContent('basemap', name, false);
      dispatch({ type: CACHE_LAYER_ROLLBACK, payload: { dataId, layerId: basemapId } });
    }
  };
}

export function cacheAreaLayer(dataType: DownloadDataType, dataId: string, layerId: string) {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const areas = state.areas.data;
    const data = dataType === 'area' ? getAreaById(areas, dataId) : getRouteById(state.routes.previousRoutes, dataId);
    const layer = getLayerById(state.layers.data, layerId);
    if (data && layer) {
      const downloadConfig = {
        data,
        layerId: layer.id,
        layerUrl: layer.url
      };
      const layerKey = `${dataId}|${layerId}`;
      trackContentDownloadStarted(layerKey);
      downloadAllLayers('contextual_layer', downloadConfig, dispatch)
        .then(path => {
          dispatch({ type: CACHE_LAYER_COMMIT, payload: { path, dataId, layerId } });
          trackDownloadedContent('layer', layerKey, true);
          return;
        })
        .catch(() => {
          dispatch({ type: CACHE_LAYER_ROLLBACK, payload: { dataId, layerId } });
          trackDownloadedContent('layer', layerKey, false);
        });
      dispatch({ type: CACHE_LAYER_REQUEST, payload: { dataId, layerId } });
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
        type: DOWNLOAD_DATA,
        payload: {
          dataId: area.id,
          basemaps
        }
      });
      dispatch(cacheLayers('area', area.id));
    }
  };
}

export function downloadRouteById(routeId: string) {
  return (dispatch: Dispatch, state: GetState) => {
    const route: ?Route = state().routes.previousRoutes?.find(route => route.id === routeId);

    if (!route) {
      console.warn('3SC - Cannot download route as it does not exist.');
      return;
    }

    // we can't download basemaps with tile urls
    const basemaps = GFW_BASEMAPS.filter(basemap => !basemap.tileUrl);

    dispatch({
      type: DOWNLOAD_DATA,
      payload: {
        dataId: route.id,
        basemaps
      }
    });
    dispatch(cacheLayers('route', route.id, !!route.geostoreId));
  };
}

export function refreshCacheById(id: string, type: DownloadDataType) {
  return (dispatch: Dispatch) => {
    dispatch({ type: INVALIDATE_CACHE, payload: id });

    if (type === 'area') {
      dispatch(downloadAreaById(id));
    } else {
      dispatch(downloadRouteById(id));
    }
  };
}

export function cacheLayers(dataType: DownloadDataType, dataId: string, hasGeostoreId: boolean = true) {
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
          syncLayersData(id => dispatch(cacheAreaBasemap(dataType, id, layer)));
        } else {
          if (dataType === 'route' && !hasGeostoreId) {
            // Here, we resolve the layer with an empty path.
            // This means that the progress bar will complete, just without requiring all of the files to be present.
            syncLayersData(id => dispatch({ type: CACHE_LAYER_COMMIT, payload: { path: '', dataId, layerId: layer } }));

            return;
          }
          syncLayersData(id => dispatch(cacheAreaLayer(dataType, id, layer)));
        }
      });
    }
  };
}

function getCacheStatusFromAreas(cacheStatus: LayersCacheStatus = {}, areas = []) {
  return areas.reduce((acc, next) => updateCachedDataStatus(acc, next.id), cacheStatus);
}

function updateCachedDataStatus(cacheStatus: LayersCacheStatus, id: string) {
  const progress = cacheStatus[id] ? cacheStatus[id].progress : 0;
  const error = cacheStatus[id] ? cacheStatus[id].error : false;
  return {
    ...cacheStatus,
    [id]: {
      error,
      progress,
      completed: progress === 1,
      requested: cacheStatus[id] ? cacheStatus[id].requested : false
    }
  };
}

export function resetCacheStatus(id: string) {
  return (dispatch: Dispatch, state: GetState) => {
    const { cacheStatus } = state().layers;
    const newCacheStatus = {
      ...cacheStatus,
      [id]: {
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

function updateDataProgress(
  id: string = '',
  cacheStatus: LayersCacheStatus = {},
  layersProgress: LayersProgress = {},
  layerCount: number = 1
) {
  if (!id || typeof id !== 'string') {
    throw new TypeError('id is not a valid string');
  }
  const areaCacheStatus = cacheStatus[id];
  const areaLayersProgress = Object.values(layersProgress[id]);
  const newProgress = areaLayersProgress.reduce((acc, next) => acc + parseFloat(next), 0) / layerCount;
  return {
    ...cacheStatus,
    [id]: {
      ...areaCacheStatus,
      progress: newProgress
    }
  };
}
