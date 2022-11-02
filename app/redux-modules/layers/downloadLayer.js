// @flow
import type { Area } from 'types/areas.types';
import type { Layer, LayerCacheData, LayerDownloadProgress } from 'types/layers.types';
import type { Route } from 'types/routes.types';
import type { DownloadDataType, LayerType } from 'types/sharing.types';
import type { Dispatch, GetState, Thunk } from 'types/store.types';
import type { BBox2d } from '@turf/helpers';

import CONSTANTS, { GFW_BASEMAPS } from 'config/constants';
import { trackDownloadedContent, trackContentDownloadStarted } from 'helpers/analytics';
import { bboxForRoute } from 'helpers/bbox';
import { storeTilesFromUrl } from 'helpers/layer-store/storeLayerFiles';
import {
  deleteMapboxOfflinePack,
  downloadOfflinePack,
  getMapboxOfflinePack,
  nameForMapboxOfflinePack,
  vectorTileURLForMapboxURL
} from 'helpers/mapbox';

import {
  IMPORT_LAYER_REQUEST,
  IMPORT_LAYER_PROGRESS,
  IMPORT_LAYER_AREA_COMPLETED,
  IMPORT_LAYER_COMMIT,
  RESET_REGION_PROGRESS,
  getAreaById,
  getRouteById
} from 'redux-modules/shared';
import * as Sentry from '@sentry/react-native';

const initialProgressState = { progress: 0, requested: false, completed: false, error: null };

/**
 * invalidateIncompleteLayerDownloads - given the layer download progress state,
 * resets any incomplete or failed downloads to their original state.
 *
 * This'll mean that on a fresh start, the UI will be refreshed & the user will
 * be able to retry downloads.
 *
 * Any completed downloads will be untouched.
 *
 * @param {LayerDownloadProgress} downloadProgress
 *
 * @returns {LayerDownloadProgress}
 */
export function invalidateIncompleteLayerDownloads(downloadProgress: LayerDownloadProgress): LayerDownloadProgress {
  const mutableProgress = { ...downloadProgress };

  const layerKeys = Object.keys(mutableProgress ?? {});

  layerKeys.forEach(key => {
    const layerProgress = mutableProgress[key];
    const regionKeys = Object.keys(layerProgress ?? {});

    regionKeys.forEach(regionKey => {
      const regionProgress = layerProgress[regionKey];

      // If the request was still in progress, or it failed, or it remains in an incomplete state, we should reset it.
      if (
        regionProgress.progress !== 100 ||
        regionProgress.error === true ||
        (regionProgress.requested && !regionProgress.completed)
      ) {
        mutableProgress[key][regionKey] = initialProgressState;
      }
    });
  });

  return mutableProgress;
}

/**
 * deleteRegionFromProgress - given the progress state, removes a given region from
 * all currently downloaded layers.
 *
 * @note - you still need to call the tile / pack deletion methods separately!
 *
 * @param {string} regionId
 * @param {LayerDownloadProgress} downloadProgress
 *
 * @returns {LayerDownloadProgress}
 */
export function deleteRegionFromProgress(
  regionId: string,
  downloadProgress: LayerDownloadProgress
): LayerDownloadProgress {
  if (!regionId) {
    return downloadProgress;
  }

  const mutableProgress = { ...downloadProgress };

  Object.keys(mutableProgress).forEach(layerId => {
    const layerProgress = mutableProgress[layerId];

    delete layerProgress[regionId];

    mutableProgress[layerId] = layerProgress;
  });

  return mutableProgress;
}

/**
 * calculateOverallDownloadProgressForRegion - for a given region (area/route),
 * determines the overall download progress across all applicable layers.
 *
 * This is because, downloading one area may involve downloading multiple layers,
 * but the progress state in the UI only shows the overall status.
 *
 * @note - this is not important in the context of downloading a given layer, as
 * the progress is tracked differently.
 *
 * @param {string} regionId
 * @param {LayerDownloadProgress} downloadProgress
 * @param {number} expectedDownloadedLayers
 *
 * @returns {LayerCacheData}
 */
export function calculateOverallDownloadProgressForRegion(
  regionId: string,
  downloadProgress: LayerDownloadProgress,
  expectedDownloadedLayers: number = 1
): LayerCacheData {
  const layersForRegion: Array<LayerCacheData> = [];

  Object.keys(downloadProgress ?? {}).forEach(layerId => {
    Object.keys(downloadProgress[layerId] ?? {}).forEach(regionKey => {
      if (regionKey === regionId) {
        layersForRegion.push(downloadProgress[layerId][regionKey]);
      }
    });
  });

  const overallCacheStatus = layersForRegion.reduce(
    (acc: LayerCacheData, currentValue: LayerCacheData) => {
      return {
        progress: acc.progress + currentValue.progress / expectedDownloadedLayers,
        completed: acc.completed && currentValue.completed,
        requested: acc.requested || currentValue.requested,
        error: acc.error || currentValue.error
      };
    },
    { progress: 0, completed: true, requested: false, error: null }
  );

  return {
    ...overallCacheStatus,
    completed: !!overallCacheStatus.completed && expectedDownloadedLayers === layersForRegion.length
  };
}

async function downloadLayer(layerType: LayerType, config, dispatch: Dispatch): Promise<string> {
  const { data, layerId, layerUrl, zoom } = config;
  return await storeTilesFromUrl(
    layerType,
    layerId,
    layerUrl,
    data.geostore?.id ?? data.geostoreId,
    [zoom.start, zoom.end],
    (received, total) => {
      const progress = (received / total) * 100;
      dispatch({ type: IMPORT_LAYER_PROGRESS, payload: { id: data.id, progress, layerId } });
    }
  );
}

function downloadAllLayers(
  layerType: LayerType,
  config: { data: Area | Route, layerId: string, layerUrl: string },
  dispatch: Dispatch
) {
  const { cacheZoom } = CONSTANTS.maps;
  return Promise.all(
    cacheZoom.map(cacheLevel => {
      const layerConfig = { ...config, zoom: cacheLevel };
      console.log('Download all layers', layerType, layerConfig);
      return downloadLayer(layerType, layerConfig, dispatch);
    })
  );
}

/**
 * importGFWContent - downloads tiles for the given basemap/layer, for every currently available area.
 * @param {LayerType} contentType
 * @param {Layer} content
 * @param {boolean} onlyNonDownloadedRegions - true if we wish to only request regions that have failed / haven't yet been attempted.
 */
export function importGFWContent(
  contentType: LayerType,
  content: Layer,
  onlyNonDownloadedRegions: boolean = false,
  downloadContent: boolean = true
): Thunk<Promise<void>> {
  return async (dispatch: Dispatch, getState: GetState) => {
    if (!downloadContent && contentType === 'contextual_layer') {
      // We're not downloading this content, so just commit.
      dispatch({ type: IMPORT_LAYER_COMMIT, payload: content });
      return;
    }

    const state = getState();

    const layerId = content.id;

    let regions = [...state.areas.data, ...state.routes.previousRoutes];

    if (onlyNonDownloadedRegions) {
      // We should only download non-downloaded regions, rather than refresh the entire cache.
      // We may do this when a new region has been created & we wish to download that new layer,
      // or when an error has occurred. Requesting all of the tiles again would be unnecessary.
      const layerProgress = state.layers.downloadedLayerProgress[layerId];

      const completedRegions = Object.keys(layerProgress ?? {}).filter(regionKey => {
        const region = layerProgress[regionKey];
        return region.completed && !region.error;
      });
      regions = regions.filter(region => !completedRegions.includes(region.id));
    }

    const regionPromises = regions.map(async region => {
      return await downloadLayerForRegion(content, region, contentType, dispatch);
    });

    await Promise.all(regionPromises);
  };
}

async function downloadLayerForRegion(
  layer: Layer,
  region: Area | Route,
  contentType: LayerType,
  dispatch: Dispatch
): Promise<void> {
  const url = contentType === 'contextual_layer' ? vectorTileURLForMapboxURL(layer.url) ?? layer.url : layer.url;

  if (!url) {
    return;
  }

  const layerId = layer.id;
  const dataId = region.id;

  if (url.startsWith('mapbox://')) {
    // This is a mapbox layer - we must use OfflineManager
    const name = nameForMapboxOfflinePack(dataId, layerId);
    const pack = await getMapboxOfflinePack(name);

    if (pack) {
      // offline pack with with this id already exists.
      console.info('3SC', 'Error: offline pack with with this id already exists');
      dispatch({
        type: IMPORT_LAYER_PROGRESS,
        payload: { id: dataId, progress: 100, layerId }
      });
      // We resolve this layer as completed successfully - as Mapbox will keep it up to date.
      dispatch(gfwContentImportCompleted(contentType, dataId, layer));
      return;
    }

    let bbox: ?BBox2d = null;

    if (region.geostore?.bbox) {
      bbox = region.geostore?.bbox;
    } else {
      try {
        bbox = bboxForRoute(region);
      } catch (error) {
        const errorString = '3SC - Could not generate Bounding Box for route - does it have two or more points?';
        console.warn(error);
        Sentry.captureException(error);
        dispatch(gfwContentImportCompleted(contentType, dataId, layer, errorString + ': ' + String(error)));
        return;
      }
    }

    if (!bbox) {
      const error = 'No bounding box for region';
      Sentry.captureException(new Error(error));
      dispatch(gfwContentImportCompleted(contentType, dataId, layer, error));
      return;
    }

    dispatch({ type: IMPORT_LAYER_REQUEST, payload: { dataId, layerId, remote: true } });

    try {
      trackContentDownloadStarted('basemap');
      await downloadOfflinePack(
        { name, url, minZoom: 1, maxZoom: CONSTANTS.maps.cacheZoom[0].end, bbox },
        (progress: number) => {
          dispatch({
            type: IMPORT_LAYER_PROGRESS,
            payload: { id: dataId, progress: progress * 100, layerId }
          });
        },
        (error: Error) => {
          trackDownloadedContent('basemap', layerId, false);
          Sentry.captureException(error);
          dispatch(gfwContentImportCompleted(contentType, dataId, layer, String(error)));
        },
        () => {
          trackDownloadedContent('basemap', layerId, true);
          dispatch(gfwContentImportCompleted(contentType, dataId, layer));
        }
      );
    } catch (error) {
      console.error('Layer download error: ', error);
      Sentry.captureException(error);
      dispatch(gfwContentImportCompleted(contentType, dataId, layer, 'Layer download error: ' + String(error)));
    }
  } else {
    trackContentDownloadStarted('layer');
    dispatch({ type: IMPORT_LAYER_REQUEST, payload: { dataId, layerId, remote: true } });
    await downloadAllLayers(contentType, { data: region, layerId, layerUrl: url }, dispatch)
      .then(path => {
        trackDownloadedContent('layer', layerId, true);
        return dispatch(gfwContentImportCompleted(contentType, region.id, layer));
      })
      .catch(error => {
        trackDownloadedContent('layer', layerId, false);
        Sentry.captureException(error);
        const errorString = 'Error downloading layer: ' + layer.name + '. ' + String(error);
        console.warn(errorString);
        dispatch(gfwContentImportCompleted(contentType, region.id, layer, errorString));
      });
  }
}

/**
 * Called whenever a GFW basemap / contextual layer download has completed, even if it completed with an error.
 * This means we can resolve the area's progress state accordingly and track the download result.
 *
 * @param {LayerType} contentType
 * @param {string} dataId
 * @param {Layer} layer
 * @param {string} error
 */
function gfwContentImportCompleted(
  contentType: LayerType,
  dataId: string,
  layer: Layer,
  error: string = null
): Thunk<Promise<void>> {
  return async (dispatch: Dispatch, getState: GetState) => {
    // We mark that region in the downloadedLayerProgress state as completed with 100% progress.
    // This means we can then keep track of regions that are still downloading / unpacking.
    await dispatch({
      type: IMPORT_LAYER_AREA_COMPLETED,
      payload: { id: dataId, layerId: layer.id, error }
    });

    if (contentType !== 'contextual_layer') {
      return;
    }

    // Check for any regions for this layer that are still in progress.
    const downloadProgressForLayer = getState().layers.downloadedLayerProgress[layer.id] ?? {};
    const remainingRegions = Object.values(downloadProgressForLayer).filter(region => region.completed !== true);

    if (remainingRegions?.length === 0) {
      // The download has completed, and we can now commit the entire layer.
      dispatch({ type: IMPORT_LAYER_COMMIT, payload: layer });
    }
  };
}

export function downloadAreaById(areaId: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const area = getAreaById(state.areas.data, areaId);

    if (!area) {
      console.warn('3SC - Cannot download area as it does not exist.');
      return;
    }

    // we can't download basemaps with tile urls
    const downloadableDefaultBasemaps = GFW_BASEMAPS.filter(basemap => basemap.url);

    const layers = [...state.layers.data, ...state.layers.imported, ...downloadableDefaultBasemaps];

    const layerPromises = layers.map(async layer => {
      return await downloadLayerForRegion(layer, area, layer.type, dispatch);
    });

    await Promise.all(layerPromises);
  };
}

export function downloadRouteById(routeId: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const route = getRouteById(state.routes.previousRoutes, routeId);

    if (!route) {
      console.warn('3SC - Cannot download route as it does not exist.');
      return;
    }

    // we can't download basemaps with tile urls
    const downloadableDefaultBasemaps = GFW_BASEMAPS.filter(basemap => basemap.url);

    const layers = [...state.layers.data, ...state.layers.imported, ...downloadableDefaultBasemaps];

    const layerPromises = layers.map(async layer => {
      return await downloadLayerForRegion(layer, route, layer.type, dispatch);
    });

    await Promise.all(layerPromises);
  };
}

export function refreshCacheById(id: string, type: DownloadDataType) {
  return (dispatch: Dispatch) => {
    if (type === 'area') {
      dispatch(downloadAreaById(id));
    } else {
      dispatch(downloadRouteById(id));
    }
  };
}

export function resetCacheStatus(regionId: string) {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState();

    const downloadProgress = { ...state.layers.downloadedLayerProgress };
    const layerKeys = Object.keys(downloadProgress ?? {});

    layerKeys.forEach(key => {
      downloadProgress[key][regionId] = { requested: false, completed: false, progress: 0, error: null };
    });

    dispatch({
      type: RESET_REGION_PROGRESS,
      payload: downloadProgress
    });
  };
}

export function deleteMapboxOfflinePacks(basemapId: string): Thunk<Promise<void>> {
  return async (dispatch: Dispatch, getState: GetState) => {
    const state = getState();

    const regionIds = [...state.areas.data, ...state.routes.previousRoutes].map(region => region.id);

    const promises = regionIds.map(async (id: string) => {
      await deleteMapboxOfflinePack(id, basemapId);
    });

    await Promise.all(promises);
  };
}
