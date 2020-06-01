// @flow
import { Platform } from 'react-native';

import RNFetchBlob from 'rn-fetch-blob';
const RNFS = require('react-native-fs');

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
 * Helper function that copies a file existing at sourceUri to destinationUri
 *
 * This helper function will create any missing directories in the destination path, and will overwrite any existing file
 */
export async function copyFileWithReplacement(sourceUri: string, destinationUri: string) {
  const destinationPath = destinationUri
    .split('/')
    .slice(0, -1)
    .join('/');

  let source = sourceUri;
  // Damn it React-Native... RNFetchBlob does not like files starting
  // with file:// on iOS!
  if (Platform.OS === 'ios' && sourceUri.startsWith("file://")) {
    source = sourceUri.slice(7);
  }

  const dirExists = await RNFetchBlob.fs.exists(destinationPath);
  if (!dirExists) {
    await RNFetchBlob.fs.mkdir(destinationPath);
  }

  const fileExists = await RNFetchBlob.fs.exists(destinationUri);
  if (fileExists) {
    await RNFetchBlob.fs.unlink(destinationUri);
  }
  await RNFetchBlob.fs.cp(source, destinationUri);
}

/**
 * List all the files under the specified directory and its subdirectories
 */
export async function listRecursive(
  path: string,
  directoryBlacklist: Array<string> = ['__MACOSX']
): Promise<Array<string>> {
  const files: Array<string> = [];
  const children = await RNFS.readDir(path);

  // eslint-disable-next-line no-unused-vars
  for (const child of children) {
    if (child.isDirectory()) {
      const isBlacklisted = directoryBlacklist.includes(child.name);
      if (!isBlacklisted) {
        const grandchildren = await listRecursive(child.path);
        files.push(...grandchildren);
      }
    } else {
      files.push(child.path);
    }
  }

  return files;
}

/**
 * Modifies the path so it is relative to the specified root directory
 */
export function pathWithoutRoot(path: string, rootDir: string): string {
  return path.replace(rootDir, '');
}

/**
 * Read a binary file from the local file system
 *
 * Avoid doing this unless necessary as the loaded file contents are sent over the bridge as base64. Process the binary
 * data natively where possible.
 */
export async function readBinaryFile(path: string): Promise<Buffer> {
  const stream = await RNFetchBlob.fs.readStream(path, 'base64');
  return new Promise((resolve, reject) => {
    stream.open();

    const chunks: Array<Buffer> = [];
    stream.onData((data: string | Array<number>) => {
      const chunk = new Buffer(data, 'base64');
      chunks.push(chunk);
    });
    stream.onEnd(() => {
      const complete = Buffer.concat(chunks);
      resolve(complete);
    });
    stream.onError(reject);
  });
}

/**
 * Writes a GoeJSON object to disk in the directory provided
 *
 * @param {Object} json The JSON object to save to disk
 * @param {string} fileName The file name to save the file as
 * @param {string} directory The directory to save the file to
 */
export async function writeJSONToDisk(json: Object, fileName: string, directory: string): Promise<void> {
  const path = directory + (directory.endsWith('/') ? '' : '/') + fileName;
  // Make the directory for saving files to, if this is already present this won't error according to docs
  await RNFS.mkdir(directory, {
    NSURLIsExcludedFromBackupKey: false // Allow this to be saved to iCloud backup!
  });
  // Write the new data to the app's storage we use RNFetchBlob here because RNFS seemed to be having
  // issues with writing large files crashing the app (Possibly due to it encoding the data it saves in the JS layer)
  await RNFetchBlob.fs.writeFile(path, JSON.stringify(json));
}
