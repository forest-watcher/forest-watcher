// @flow
import type { File } from 'types/file.types';
import type { LayerFile } from 'types/sharing.types';

import { unzip } from 'react-native-zip-archive';
const RNFS = require('react-native-fs');

import CONSTANTS from 'config/constants';
import { assertMaximumFileSize, listRecursive } from 'helpers/fileManagement';
import { storeGeoJson } from 'helpers/layer-store/storeLayerFiles';

import convertToGeoJSON from './convertToGeoJSON';

export default async function importKMZFile(file: File & { uri: string }, fileName: string): Promise<LayerFile> {
  const tempZipPath = RNFS.TemporaryDirectoryPath + fileName.replace(/\.[^/.]+$/, '.zip');
  const tempPath = RNFS.TemporaryDirectoryPath + fileName.replace(/\.[^/.]+$/, '');
  try {
    await RNFS.copyFile(file.uri, tempZipPath);
    const location = await unzip(tempZipPath, tempPath);
    // Don't need to check if folder exists because unzip will have created it
    const files = await listRecursive(location);
    const mainFile = files.find(file => file.endsWith('.kml'));
    if (!mainFile) {
      throw new Error('Invalid KMZ bundle, missing a root .kml file');
    }
    await assertMaximumFileSize(mainFile, CONSTANTS.files.maxFileSizeForLayerImport);
    const geoJSON = await convertToGeoJSON(mainFile, 'kml');

    const importedFile = await storeGeoJson(file.id, geoJSON);

    return importedFile;
  } finally {
    try {
      RNFS.unlink(tempZipPath);
      RNFS.unlink(tempPath);
    } catch (err) {
      console.warn('3SC', 'RNFS unlink error: ', err);
    }
  }
}
