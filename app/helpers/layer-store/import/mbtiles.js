// @flow
import type { File } from 'types/file.types';
import type { LayerFile } from 'types/sharing.types';

const RNFS = require('react-native-fs');

import { directoryForMBTilesFile } from 'helpers/layer-store/layerFilePaths';

export default async function importMBTilesFile(file: File & { uri: string }, fileName: string): Promise<LayerFile> {
  const size = isNaN(file.size) ? 0 : file.size;

  const baseDirectory = directoryForMBTilesFile(file);
  const path = `${baseDirectory}/${file.id}.mbtiles`;

  await RNFS.mkdir(baseDirectory);
  await RNFS.copyFile(file.uri, path);

  return {
    path: baseDirectory,
    type: 'basemap',
    layerId: file.id,
    tileXYZ: [0, 0, 0],
    size,
    subFiles: [`${file.id}.mbtiles`]
  };
}
