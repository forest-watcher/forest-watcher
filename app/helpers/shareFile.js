// @flow

import Share from 'react-native-share';

/**
 * shareFile - given a path to a file on disk, opens a share modal to allow
 * other apps to be given the file / for the file to be saved to disk.
 *
 * @param {string} path
 * @param {?string} mimeType
 */
export default async function shareFile(path: string, mimeType?: string): Promise<void> {
  const res = await Share.open({
    saveToFiles: true,
    url: `file://${path}`,
    type: mimeType,
    showAppsToView: true,
    failOnCancel: false
  })
  return res;
}
