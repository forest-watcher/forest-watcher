// @flow
import type { Basemap } from 'types/basemaps.types';
import type { File } from 'types/file.types';
import type { LayerFile } from 'types/sharing.types';
import { Platform } from 'react-native';
import togeojson from 'helpers/toGeoJSON';
import { directoryForMBTilesFile } from 'helpers/layer-store/layerFilePaths';
import { storeGeoJson } from 'helpers/layer-store/storeLayerFiles';
import { unzip } from 'react-native-zip-archive';
import { listRecursive, readBinaryFile } from 'helpers/fileManagement';
import shapefile from 'shpjs';
import { feature, featureCollection } from '@turf/helpers';

const DOMParser = require('xmldom').DOMParser;
const RNFS = require('react-native-fs');

/**
 * TODO: Split each file format in this switch statement out into separate functions
 */
export async function importLayerFile(layerFile: File): Promise<LayerFile> {
  const { file, fileName, fileExtension } = getFormattedFile(layerFile);

  switch (fileExtension) {
    case 'mbtiles': {
      const size = isNaN(file.size) ? 0 : file.size;

      const baseDirectory = directoryForMBTilesFile(file);
      const path = `${baseDirectory}/${file.id}.mbtiles`;

      await RNFS.mkdir(baseDirectory);
      await RNFS.copyFile(file.uri, path);

      return { path: path, type: 'basemap', layerId: file.id, tileXYZ: [0, 0, 0], size };
    }
    case 'json':
    case 'topojson':
    case 'geojson': {
      // Read from file so we can remove null geometries
      const fileContents = await RNFS.readFile(file.uri);
      let geojson = JSON.parse(fileContents);

      if (geojson.type === 'Topology' && !!geojson.objects) {
        geojson = togeojson.topojson(geojson);
      }

      return await storeGeoJson(file.id, geojson);
    }
    case 'kml':
    case 'gpx': {
      const geoJSON = await convertToGeoJSON(file.uri, fileExtension);
      return await storeGeoJson(file.id, geoJSON);
    }
    case 'kmz': {
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
        const geoJSON = await convertToGeoJSON(mainFile, 'kml');
        return await storeGeoJson(file.id, geoJSON);
      } finally {
        RNFS.unlink(tempZipPath);
        RNFS.unlink(tempPath);
      }
    }
    case 'zip': {
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
        return await storeGeoJson(file.id, features);
      } finally {
        RNFS.unlink(tempZipPath.replace(/\.[^/.]+$/, ''));
        RNFS.unlink(tempZipPath);
      }
    }
    default:
      //todo: Add support for other file types! These need converting to geojson before saving.
      throw new Error(`Could not process file with extension: ${fileExtension}`);
  }
}

function getFormattedFile(layerFile: File) {
  // We have to decode the file URI because iOS file manager doesn't like encoded uris!
  const file = {
    ...layerFile,
    uri: Platform.OS === 'android' ? layerFile.uri : decodeURI(layerFile.uri)
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

/**
 * Converts a file to GeoJSON
 *
 * @param {string} file The file uri to read and convert to GeoJSON
 * @param {string} directory The directory to save the file to
 *
 * @returns {Object} The converted GeoJSON
 */
async function convertToGeoJSON(uri: string, extension: string) {
  // Read from file so we can convert to GeoJSON
  const fileContents = await RNFS.readFile(uri);
  // Parse XML from file string
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(fileContents);
  // Convert to GeoJSON using mapbox's library!
  const geoJSON =
    extension === 'gpx' ? togeojson.gpx(xmlDoc, { styles: true }) : togeojson.kml(xmlDoc, { styles: true });

  return geoJSON;
}
