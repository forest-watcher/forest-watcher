// @flow
import type { ContextualLayer, LayersState, LayersAction, LayersCacheStatus, LayersProgress } from 'types/layers.types';
import type { Dispatch, GetState, State } from 'types/store.types';
import type { Area } from 'types/areas.types';
import type { File } from 'types/file.types';
import type { LayerType } from 'helpers/layer-store/layerFilePaths';

import Config from 'react-native-config';
import { unzip } from 'react-native-zip-archive';
import omit from 'lodash/omit';
import CONSTANTS from 'config/constants';
import { getActionsTodoCount } from 'helpers/sync';
import { cleanGeoJSON } from 'helpers/map';
import { writeJSONToDisk, listRecursive, readBinaryFile } from 'helpers/fileManagement';

import { LOGOUT_REQUEST } from 'redux-modules/user';
import { SAVE_AREA_COMMIT, DELETE_AREA_COMMIT } from 'redux-modules/areas';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

import tracker from 'helpers/googleAnalytics';
import { Platform } from 'react-native';
import { storeTilesFromUrl } from 'helpers/layer-store/storeLayerFiles';
import deleteLayerFiles from 'helpers/layer-store/deleteLayerFiles';

import togeojson from 'helpers/toGeoJSON';
import shapefile from 'shpjs';
import { feature, featureCollection } from '@turf/helpers';

const DOMParser = require('xmldom').DOMParser;
const RNFS = require('react-native-fs');

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

const IMPORT_LAYER_REQUEST = 'layers/IMPORT_LAYER_REQUEST';
const IMPORT_LAYER_COMMIT = 'layers/IMPORT_LAYER_COMMIT';
const IMPORT_LAYER_CLEAR = 'layers/IMPORT_LAYER_CLEAR';
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
    case IMPORT_LAYER_CLEAR: {
      return { ...state, importingLayer: null, importError: null };
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
      deleteLayerFiles().then(console.info('Folder removed successfully'));
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

export function clearImportContextualLayerState() {
  return {
    type: IMPORT_LAYER_CLEAR
  };
}

export function importContextualLayer(layerFile: File) {
  return async (dispatch: Dispatch, state: GetState) => {
    // We have to decode the file URI because iOS file manager doesn't like encoded uris!
    const file = {
      ...layerFile,
      uri: decodeURI(layerFile.uri)
    };

    const fileName = Platform.select({
      android: file.fileName,
      ios: file.uri.substring(file.uri.lastIndexOf('/') + 1)
    });
    const finalFileName = fileName.replace(/\.[^/.]+$/, '.geojson');

    dispatch({ type: IMPORT_LAYER_REQUEST, payload: file.uri });

    //TODO: remove, this is just for testing!
    // await RNFS.unlink(RNFS.DocumentDirectoryPath + '/' + IMPORTED_LAYERS_DIRECTORY + '/' + fileName)

    // Set these up as constants
    const relativePath = '/' + IMPORTED_LAYERS_DIRECTORY + '/' + finalFileName;
    const directory = RNFS.DocumentDirectoryPath + '/' + IMPORTED_LAYERS_DIRECTORY;
    const fileExtension = fileName
      .split('.')
      .pop()
      .toLowerCase();

    // The final file that will have been imported
    const importedFile = {
      ...file,
      type: 'application/geo+json',
      path: relativePath,
      fileName: finalFileName
    };

    switch (fileExtension) {
      case 'json':
      case 'topojson':
      case 'geojson': {
        try {
          await RNFS.mkdir(directory, {
            NSURLIsExcludedFromBackupKey: false // Allow this to be saved to iCloud backup!
          });
          // Read from file so we can remove null geometries
          const fileContents = await RNFS.readFile(file.uri);
          let geojson = JSON.parse(fileContents);

          if (geojson.type === 'Topology' && !!geojson.objects) {
            geojson = togeojson.topojson(geojson);
          }

          const cleanedGeoJSON = cleanGeoJSON(geojson);
          await writeJSONToDisk(cleanedGeoJSON, finalFileName, directory);

          dispatch({
            type: IMPORT_LAYER_COMMIT,
            payload: importedFile
          });
        } catch (err) {
          dispatch({ type: IMPORT_LAYER_ROLLBACK, payload: err });
          throw err;
        }
        break;
      }
      case 'kml':
      case 'gpx': {
        try {
          const geoJSON = await convertToGeoJSON(file.uri, fileExtension);
          const cleanedGeoJSON = cleanGeoJSON(geoJSON);
          await writeJSONToDisk(cleanedGeoJSON, finalFileName, directory);
          dispatch({
            type: IMPORT_LAYER_COMMIT,
            payload: importedFile
          });
        } catch (err) {
          dispatch({ type: IMPORT_LAYER_ROLLBACK, payload: err });
          throw err;
        }
        break;
      }
      case 'kmz': {
        const tempZipPath = RNFS.TemporaryDirectoryPath + fileName.replace(/\.[^/.]+$/, '.zip');
        try {
          await RNFS.copyFile(file.uri, tempZipPath);
          const tempPath = RNFS.TemporaryDirectoryPath + fileName.replace(/\.[^/.]+$/, '');
          const location = await unzip(tempZipPath, tempPath);
          // Don't need to check if folder exists because unzip will have created it
          const files = await listRecursive(location);
          const mainFile = files.find(file => file.name.endsWith('.kml'));
          if (!mainFile) {
            throw new Error('Invalid KMZ bundle, missing a root .kml file');
          }
          const geoJSON = await convertToGeoJSON(location + '/' + mainFile.name, 'kml');
          const cleanedGeoJSON = cleanGeoJSON(geoJSON);
          await writeJSONToDisk(cleanedGeoJSON, finalFileName, directory);
          await RNFS.unlink(tempPath);
          dispatch({
            type: IMPORT_LAYER_COMMIT,
            payload: importedFile
          });
        } catch (err) {
          // Fire and forget!
          dispatch({ type: IMPORT_LAYER_ROLLBACK, payload: err });
          throw err;
        } finally {
          RNFS.unlink(tempZipPath);
        }
        break;
      }
      case 'zip': {
        // Unzip the file ourself, as the shapefile library uses a node module which is only supported in browsers
        const tempZipPath = RNFS.TemporaryDirectoryPath + fileName;
        try {
          await RNFS.copyFile(file.uri, tempZipPath);
          const extensionLessFileName = fileName.replace(/\.[^/.]+$/, '');
          const tempPath = RNFS.TemporaryDirectoryPath + extensionLessFileName;
          // Use the response here in-case it unzips strangely (Have seen this myself: Simon)
          const unzippedPath = await unzip(tempZipPath, tempPath);

          // Add trailing slash, otherwise we read the directory itself!
          const shapeFileContents = await listRecursive(unzippedPath);

          // Get the name of the shapefile, as this isn't always the file name of the zip file itself
          const shapeFilePath = shapeFileContents.find(path => path.endsWith('.shp'));

          if (!shapeFilePath) {
            throw new Error('Zip file does not contain a file with extension .shp');
          }
          const shapeFileData = await readBinaryFile(shapeFilePath);

          const projectionFilePath = shapeFileContents.find(path => path.endsWith('.prj'));
          const projectionFileData = projectionFilePath ? await readBinaryFile(projectionFilePath) : null;
          // We send the file path in here without the .shp extension as the library adds this itself
          const polygons = await shapefile.parseShp(shapeFileData, projectionFileData);
          const features = featureCollection(polygons.map(polygon => feature(polygon)));
          await writeJSONToDisk(features, finalFileName, directory);

          await RNFS.unlink(unzippedPath);

          dispatch({
            type: IMPORT_LAYER_COMMIT,
            payload: importedFile
          });
        } catch (err) {
          // Fire and forget!
          dispatch({ type: IMPORT_LAYER_ROLLBACK, payload: err });
          throw err;
        } finally {
          RNFS.unlink(tempZipPath.replace(/\.[^/.]+$/, ''));
          RNFS.unlink(tempZipPath);
        }
        break;
      }
      default:
        //todo: Add support for other file types! These need converting to geojson before saving.
        break;
    }
  };
}

/**
 * Converts a file to GeoJSON
 *
 * @param {string} file The file uri to read and convert to GeoJSON
 * @param {string} directory The directory to save the file to
 *
 * @returns {Object} The converted GeoJSON
 */
async function convertToGeoJSON(uri: string, extension: string) {
  // Read from file so we can convert to GeoJSON
  const fileContents = await RNFS.readFile(uri);
  // Parse XML from file string
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(fileContents);
  // Convert to GeoJSON using mapbox's library!
  const geoJSON =
    extension === 'gpx' ? togeojson.gpx(xmlDoc, { styles: true }) : togeojson.kml(xmlDoc, { styles: true });

  return geoJSON;
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

export function cacheAreaBasemap(areaId: string) {
  return (dispatch: Dispatch, state: GetState) => {
    const areas = state().areas.data;
    const area = getAreaById(areas, areaId);
    const layer: ContextualLayer = {
      id: 'basemap',
      url: CONSTANTS.maps.basemap
    };
    if (area) {
      const downloadConfig = {
        area,
        layerId: layer.id,
        layerUrl: layer.url
      };

      downloadAllLayers('basemap', downloadConfig, dispatch)
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
      downloadAllLayers('contextual_layer', downloadConfig, dispatch)
        .then(payload =>
          dispatch({
            payload,
            meta: { area, layer },
            type: CACHE_LAYER_COMMIT
          })
        )
        .catch(() => {
          dispatch({
            meta: { area, layer },
            type: CACHE_LAYER_ROLLBACK
          });
        });
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

function updateCacheAreaStatus(cacheStatus: LayersCacheStatus, area: { id: string }) {
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

export function getImportedContextualLayersById(layerIds: Array<string>) {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    return [...state.layers.imported].filter(layer => {
      return layerIds.includes(layer.id);
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
