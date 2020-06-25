// @flow
import type { File } from 'types/file.types';
import type { LayerFile } from 'types/sharing.types';

const RNFS = require('react-native-fs');
import { unzip } from 'react-native-zip-archive';
import shapefile from 'shpjs';
import { feature, featureCollection } from '@turf/helpers';

import { listRecursive, readBinaryFile } from 'helpers/fileManagement';
import { storeGeoJson } from 'helpers/layer-store/storeLayerFiles';

export default async function importZipFile(file: File & { uri: string }, fileName: string): Promise<LayerFile> {
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
    await RNFS.unlink(unzippedPath);

    const importedFile = await storeGeoJson(file.id, features);

    return importedFile;
  } finally {
    RNFS.unlink(tempZipPath.replace(/\.[^/.]+$/, ''));
    RNFS.unlink(tempZipPath);
  }
}
