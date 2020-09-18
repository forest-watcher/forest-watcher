// @flow
import type { File } from 'types/file.types';
import type { LayerFile } from 'types/sharing.types';
import { Platform } from 'react-native';

import importMBTilesFile from './mbtiles';
import importJSONFile from './json';
import importKMZFile from './kmz';
import importZipFile from './zip';
import importKMLOrGPXFile from './kmlGpx';

/**
 * importLayerFile - given a file, determines the formatting & imports it accordingly
 * into the app's content structure.
 *
 * Currently supported file formats:
 * - mbtiles (basemaps)
 * - json | topojson | geojson | kml | gpx | kmz | zip (contextual layers)
 *
 * @note if the file format is unsupported, an error will be thrown
 * @param {File} layerFile
 *
 * @returns {Promise<LayerFile>}
 * @throws an error if the format is unsupported, or if the importing fails.
 */
export async function importLayerFile(layerFile: File): Promise<LayerFile> {
  const { file, fileName, fileExtension } = getFormattedFile(layerFile);

  switch (fileExtension) {
    case 'mbtiles': {
      return await importMBTilesFile(file, fileName);
    }
    case 'json':
    case 'topojson':
    case 'geojson': {
      return await importJSONFile(file, fileName);
    }
    case 'kml':
    case 'gpx': {
      return await importKMLOrGPXFile(file, fileName, fileExtension);
    }
    case 'kmz': {
      return await importKMZFile(file, fileName);
    }
    case 'zip': {
      return await importZipFile(file, fileName);
    }
    default:
      // This provided file format is unsupported - throw an error to inform the caller of this.
      // If we wish to add support - the file may need converting to geojson before saving.
      throw new Error(`Could not process file with extension: ${fileExtension}`);
  }
}

function getFormattedFile(layerFile: File) {
  // We have to decode the file URI because iOS file manager doesn't like encoded uris!
  // On iOS, we also need to remove `file:///` from the uri string.
  const file = {
    ...layerFile,
    uri: Platform.OS === 'android' ? layerFile.uri : decodeURI(layerFile.uri).replace('file:///', '')
  };

  const fileName = Platform.select({
    android: file.fileName,
    ios: file.uri.substring(file.uri.lastIndexOf('/') + 1)
  });

  // Set these up as constants
  const fileExtension = fileName
    .split('.')
    .pop()
    .toLowerCase();

  return { file, fileName, fileExtension };
}
