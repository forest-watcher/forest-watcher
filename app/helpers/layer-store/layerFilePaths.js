// @flow

import type { Feature, Polygon } from '@turf/helpers';
import tilebelt from '@mapbox/tilebelt';
import CONSTANTS from 'config/constants';
import RNFetchBlob from 'rn-fetch-blob';

export type LayerType = 'basemap' | 'contextual_layer';

export const LAYER_ROOT_DIR = `${RNFetchBlob.fs.dirs.DocumentDir}/${CONSTANTS.files.tiles}`;

/**
 * Delimiter used to separate x, y, and z from a tile filename, e.g. 4x13x7.png
 */
const TILE_FILE_PART_DELIMITER = 'x';

export function pathForLayer(type: LayerType, id: string): string {
  const path = pathForLayerType(type);
  return `${path}/${id}`;
}

export function pathForLayerType(type: LayerType): string {
  return `${LAYER_ROOT_DIR}/${type}`;
}

export function pathWithoutRoot(path: string): string {
  return path.replace(LAYER_ROOT_DIR, '');
}

export function tileFileNameToPolygon(fileName: string): Feature<Polygon> {
  const splitExt = fileName.split('.');
  const name = splitExt[0];
  const nameParts = name.split(TILE_FILE_PART_DELIMITER);
  const tileZXY = nameParts.slice(0, 3).map(part => parseInt(part)); // tiles are stored in ZXY order
  const tileXYZ = [tileZXY[1], tileZXY[2], tileZXY[0]];
  return tilebelt.tileToGeoJSON(tileXYZ);
}
