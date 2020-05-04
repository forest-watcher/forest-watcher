// @flow

import { unzip as internalUnzip } from 'react-native-zip-archive';
const RNFS = require('react-native-fs');

/**
 * Unzips a file from one location to another returning the unzipped root directory
 *
 * If the zip contains a single root directory, the function will return the path to root directory, otherwise
 * it will return the path passed in to unzip to
 *
 * @param {string} fromLocation - The zip file to unzip
 * @param {string} toLocation - Where to unzip the archive to
 *
 * @returns {string} The location the zip was unarchived to
 */
export async function unzip(fromLocation: string, toLocation: string): string {
  const response = await internalUnzip(fromLocation, toLocation);
  const zipContents = await RNFS.readDir(response);

  if (zipContents.length === 0) {
    throw new Error('Zip archive contains no files or folders');
  } else if (zipContents.length === 1 && zipContents[0].isDirectory()) {
    const res = zipContents[0];
    return res.path;
  } else {
    return response;
  }
}
