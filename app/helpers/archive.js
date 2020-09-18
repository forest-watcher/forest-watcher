// @flow
import { zip } from 'react-native-zip-archive';

/**
 * zipFolder - given a path to a directory, and a target path for the zip,
 * archives the folder into a .zip archive and returns the file path.
 *
 * @param {string} directory
 * @param {string} targetPath
 *
 * @returns {Promise<string>}
 */
export default async function zipFolder(directory: string, targetPath: string): Promise<string> {
  return await zip(directory, targetPath);
}
