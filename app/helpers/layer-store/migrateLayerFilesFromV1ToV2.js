// @flow

import type { LayerFile } from 'types/sharing.types';
import { layerRootDir, tileForFileName } from 'helpers/layer-store/layerFilePaths';
import { storeLayerFiles } from 'helpers/layer-store/storeLayerFiles';
const RNFS = require('react-native-fs');

/**
 * In v1 tiles are stored in this structure: tiles/<area_id>/<layer_id>/{z}x{x}x{y}
 * In v2 tiles are stored in this structure: tiles/<layer_type>/<layer_id>/{z}x{x}x{y}
 */
export default async function migrateLayerFilesFromV1ToV2() {
  const v1AreaDirs = await findV1AreaDirectories();
  const v1TileFiles = await findV1TileFiles(v1AreaDirs);
  console.warn('3SC', 'Migrate layer files from v1', v1TileFiles.length);
  await storeLayerFiles(v1TileFiles, 'move');
  deleteV1AreaDirectories(v1AreaDirs);
}

const deleteV1AreaDirectories = async (paths: Array<string>): Promise<void> => {
  // eslint-disable-next-line no-unused-vars
  for (const path of paths) {
    try {
      await RNFS.unlink(path);
    } catch (err) {
      console.warn('3SC', `Could not delete ${path}`);
    }
  }
};

const findV1AreaDirectories = async (): Promise<Array<string>> => {
  const rootDir = layerRootDir();
  const children = await RNFS.readDir(rootDir);
  return children
    .filter(child => child.isDirectory() && child.name !== 'contextual_layer' && child.name !== 'basemap')
    .map(child => child.path);
};

const findV1TileFiles = async (v1AreaDirs: Array<string>): Promise<Array<LayerFile>> => {
  const allTileFiles: Array<LayerFile> = [];

  // eslint-disable-next-line no-unused-vars
  for (const areaDir of v1AreaDirs) {
    const layerDirs = await RNFS.readDir(areaDir);

    // eslint-disable-next-line no-unused-vars
    for (const layerDir of layerDirs) {
      if (!layerDir.isDirectory() || layerDir.name === 'basemap') {
        continue;
      }

      const tileFiles = await RNFS.readDir(layerDir.path);
      const tilesInDir = tileFiles
        .filter(file => file.isFile())
        .map(tileFile => ({
          path: tileFile.path,
          type: 'contextual_layer',
          layerId: layerDir.name,
          tileXYZ: tileForFileName(tileFile.name),
          size: tileFile.size
        }));

      allTileFiles.push(...tilesInDir);
    }
  }

  return allTileFiles;
};
