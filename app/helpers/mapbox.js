// @flow
import type { BBox2d } from '@turf/helpers';

import Config from 'react-native-config';
import MapboxGL from '@react-native-mapbox-gl/maps';

const MAPBOX_DOWNLOAD_COMPLETED_STATE = 2;

const MAPBOX_URL_REGEX = /^mapbox:\/\/[a-zA-Z\d]+.[a-zA-Z\d]+$/;

/**
 * Defines the parameters required for downloading a Mapbox offline pack.
 */
export type MapboxOfflinePackConfig = {
  name: string,
  url: string,
  minZoom: number,
  maxZoom: number,
  bbox: BBox2d
};

/**
 * Converts a mapbox url of format: 'mapbox://{username}.{tileset_id}'
 *
 * If the url is not of the correct format, null will be returned
 * @param {string} url
 *
 * @returns {string}
 */
export const vectorTileURLForMapboxURL = (url: string): ?string => {
  if (!url.match(MAPBOX_URL_REGEX)) {
    return null;
  }
  const path = url.replace(/^(mapbox:\/\/)/, Config.MAPBOX_BASE_URL);
  return path + '/{z}/{x}/{y}.vector.pbf?access_token=' + Config.MAPBOX_TOKEN;
};

/**
 * nameForMapboxOfflinePack - merges the contentID / basemapId into a single string,
 * that is used for identifying mapbox packs.
 * @param {string} contentId
 * @param {string} basemapId
 *
 * @returns {string}
 */
export const nameForMapboxOfflinePack = (contentId: string, basemapId: string): string => {
  return `${contentId}|${basemapId}`;
};

/**
 * getMapboxOfflinePack - wraps the MapboxGL function, returning the offline maptile pack for
 * the given name, if it exists.
 * @param {string} packName
 */
export const getMapboxOfflinePack = async (packName: string): Promise<?MapboxGL.OfflinePack> => {
  return await MapboxGL.offlineManager.getPack(packName);
};

/**
 * deleteMapboxOfflinePack - given the area / route id + basemap ID, deletes the corresponding
 * basemap offline pack.
 * @param {string} contentId
 * @param {string} basemapId
 */
export const deleteMapboxOfflinePack = async (contentId: string, basemapId: string) => {
  const name = nameForMapboxOfflinePack(contentId, basemapId);

  await MapboxGL.offlineManager.deletePack(name);
};

/**
 * deleteAllOfflinePacks - deletes all mapbox offline packs.
 */
export const deleteAllOfflinePacks = async () => {
  await MapboxGL.offlineManager.resetDatabase();
};

/**
 * downloadOfflinePack - given request parameters and event handlers, attempts to download
 * map tiles for the given bounds.
 * @param {MapboxOfflinePackConfig} config
 * @param {(progress: number) => void} progressEventHandler a callback that provides a percentage value between 0 -> 1.
 * @param {(error: Error) => void} errorEventHandler a callback that provides an error, if one occurs.
 * @param {() => void} successEventHandler a callback that is fired when the download completes without error.
 */
export const downloadOfflinePack = async (
  config: MapboxOfflinePackConfig,
  progressEventHandler: (progress: number) => void,
  errorEventHandler: (error: Error) => void,
  successEventHandler: () => void
) => {
  const progressListener = (offlineRegion, status) => {
    if (!status.percentage) {
      return;
    }
    progressEventHandler(status.percentage / 100);

    if (status.state === MAPBOX_DOWNLOAD_COMPLETED_STATE) {
      successEventHandler();
    }
  };

  const errorListener = (offlineRegion, err) => {
    console.error('3SC download layer error: ', err);
    errorEventHandler(err);
  };

  const { name, url, minZoom, maxZoom, bbox } = config;

  const areaBounds = [[bbox[2], bbox[3]], [bbox[0], bbox[1]]];

  const downloadPackOptions = {
    name,
    styleURL: url,
    minZoom: minZoom,
    maxZoom: maxZoom,
    bounds: areaBounds
  };

  await MapboxGL.offlineManager.createPack(downloadPackOptions, progressListener, errorListener);
};
