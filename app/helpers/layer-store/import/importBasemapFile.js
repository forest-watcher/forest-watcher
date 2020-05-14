// @flow
import type { File } from 'types/file.types';
import type { Basemap } from 'types/basemaps.types';
import { pathForLayerFile } from 'helpers/layer-store/layerFilePaths';

const RNFS = require('react-native-fs');

/**
 * storeBasemap - given a basemap file reference, copies it into the app directory.
 * @param {File} file the basemap file, selected from the native file manager.
 * @returns {Basemap} metadata that can be saved in redux.
 */
export async function storeBasemap(file: File): Promise<Basemap> {
  const stats = await RNFS.stat(file.uri);
  const size = stats.size;

  const baseDirectory = `${pathForLayerFile({ ...file, type: 'basemap', layerId: file.id, tileXYZ: [0, 0, 0] })}`;
  const path = `${baseDirectory}/${file.id}.mbtiles`;

  await RNFS.mkdir(baseDirectory);
  await RNFS.copyFile(file.uri, path);

  return { path: path, id: file.id, size: size, name: file.name ?? '' };
}
