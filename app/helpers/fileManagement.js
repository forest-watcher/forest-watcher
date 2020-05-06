const RNFS = require('react-native-fs');
import RNFetchBlob from 'rn-fetch-blob';

global.Buffer = global.Buffer || require('buffer').Buffer; // eslint-disable-line

if (typeof btoa === 'undefined') {
  global.btoa = function(str) {
    return new Buffer(str).toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function(b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString();
  };
}

/**
 * Writes a GoeJSON object to disk in the directory provided
 *
 * @param {Object} json The JSON object to save to disk
 * @param {string} fileName The file name to save the file as
 * @param {string} directory The directory to save the file to
 */
export async function writeJSONToDisk(json, fileName, directory) {
  const path = directory + (directory.endsWith('/') ? '' : '/') + fileName;
  // Make the directory for saving files to, if this is already present this won't error according to docs
  await RNFS.mkdir(directory, {
    NSURLIsExcludedFromBackupKey: false // Allow this to be saved to iCloud backup!
  });
  // Write the new data to the app's storage we use RNFetchBlob here because RNFS seemed to be having
  // issues with writing large files crashing the app (Possibly due to it encoding the data it saves in the JS layer)
  await RNFetchBlob.fs.writeFile(path, JSON.stringify(json));
}
