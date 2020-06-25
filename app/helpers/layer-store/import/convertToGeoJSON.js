// @flow

const DOMParser = require('xmldom').DOMParser;
const RNFS = require('react-native-fs');

import togeojson from 'helpers/toGeoJSON';

/**
 * Converts a file to GeoJSON
 *
 * @param {string} file The file uri to read and convert to GeoJSON
 * @param {string} directory The directory to save the file to
 *
 * @returns {Object} The converted GeoJSON
 */
export default async function convertToGeoJSON(uri: string, extension: string) {
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
