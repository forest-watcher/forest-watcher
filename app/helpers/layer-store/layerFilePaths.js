// @flow

import CONSTANTS from 'config/constants';
import RNFetchBlob from 'rn-fetch-blob';
import type { LayerFile } from 'types/sharing.types';

export type LayerType = 'basemap' | 'contextual_layer';

/**
 * Delimiter used to separate x, y, and z from a tile filename, e.g. 4x13x7.png
 */
const TILE_FILE_PART_DELIMITER = 'x';

/**
 * For legacy reasons the tile coordinates are in Z - X - Y order
 */
export function fileNameForTile(tileXYZ: [number, number, number]) {
  return `${tileXYZ[2]}${TILE_FILE_PART_DELIMITER}${tileXYZ[0]}${TILE_FILE_PART_DELIMITER}${tileXYZ[1]}`;
}

export function layerRootDir() {
  return `${RNFetchBlob.fs.dirs.DocumentDir}/${CONSTANTS.files.tiles}`;
}

/**
 * Constructs the storage path used for the layer of the specified type and ID
 */
export function pathForLayer(type: LayerType, id: string, dir: string = layerRootDir()): string {
  const path = pathForLayerType(type, dir);
  return `${path}/${id}`;
}

export function pathForLayerFile(file: LayerFile, dir: string = layerRootDir()): string {
  const path = pathForLayer(file.type, file.layerId, dir);
  const name = fileNameForTile(file.tileXYZ);
  return `${path}/${name}`;
}

/**
 * Constructs the storage path used for layers of the specified type
 */
export function pathForLayerType(type: LayerType, dir: string = layerRootDir()): string {
  return `${dir}/${type}`;
}

/**
 * Modified the path so it is relative to the root storage for layers
 */
export function pathWithoutRoot(path: string): string {
  return path.replace(layerRootDir(), '');
}

/**
 * Given a filename representing a quadtree tile (i.e. {z}x{x}x{y}), extracts the GeoJson polygon associated with that
 * tile
 */
export function tileForFileName(fileName: string): [number, number, number] {
  const splitExt = fileName.split('.');
  const name = splitExt[0];
  const nameParts = name.split(TILE_FILE_PART_DELIMITER);
  const tileZXY = nameParts.slice(0, 3).map(part => parseInt(part)); // tiles are stored in ZXY order
  const tileXYZ = [tileZXY[1], tileZXY[2], tileZXY[0]];
  return tileXYZ;
}
