import { readTextFile } from 'helpers/fileManagement';
import { GeoJSONObject } from '@turf/helpers';
import * as xmldom from '@xmldom/xmldom';
import togeojson from 'helpers/toGeoJSON';

const { DOMParser } = xmldom;

/**
 * Converts a file to GeoJSON
 *
 * @param uri - The file uri to read and convert to GeoJSON
 * @param extension - The file extension ('gpx' or 'kml')
 *
 * @returns The converted GeoJSON
 */
export default async function convertToGeoJSON(uri: string, extension: string): Promise<GeoJSONObject> {
  // Read from file so we can convert to GeoJSON
  const fileContents = await readTextFile(uri);
  // Parse XML from file string
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(fileContents);
  // Convert to GeoJSON using mapbox's library!
  const geoJSON =
    extension === 'gpx' ? togeojson.gpx(xmlDoc, { styles: true }) : togeojson.kml(xmlDoc, { styles: true });

  return geoJSON as GeoJSONObject;
}
