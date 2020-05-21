// @flow
import type { Dispatch } from 'types/store.types';
import type { ImportBundleResult, UnpackedSharingBundle } from 'types/sharing.types';
import { Platform } from 'react-native';

import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';

import FWError from 'helpers/fwError';
import createTemporaryStagingDirectory from 'helpers/sharing/createTemporaryStagingDirectory';
import deleteStagedBundle from 'helpers/sharing/deleteStagedBundle';
import { BUNDLE_DATA_FILE_NAME } from 'helpers/sharing/exportBundle';
import { APP_DATA_FORMAT_VERSION } from 'helpers/sharing/exportAppData';
import importAppData from 'helpers/sharing/importAppData';

/**
 * Imports a FW sharing bundle into the app
 *
 * @param uri - The file to import
 * @param dispatch - Redux dispatch function used to emit actions to add data to the app
 */
export default async function importBundle(uri: string, dispatch: Dispatch): Promise<void> {
  console.warn('3SC', 'Importing bundle...', uri);
  const unpackedBundle = await unpackBundle(uri);
  importStagedBundle(unpackedBundle, dispatch);
  deleteStagedBundle(unpackedBundle);
  console.warn('3SC', 'Successfully unpacked bundle');
}

function checkBundleCompatibility(version: number) {
  if (version > APP_DATA_FORMAT_VERSION) {
    throw new FWError('Cannot read incompatible bundle version');
  } else if (version < APP_DATA_FORMAT_VERSION) {
    // For past versions we can either (i) migrate or (ii) fail
    // Handle those decisions for each past version here
    console.warn('3SC', 'Processing bundle created using an old format. We should explicitly handle this.');
  }
}

/**
 * Imports the data held in an unpacked bundle into the app
 *
 * @param bundle - The bundle - already unpacked - whose data should be imported
 * @param dispatch - Redux dispatch function used to emit actions to add data to the app
 */
export function importStagedBundle(bundle: UnpackedSharingBundle, dispatch: Dispatch) {
  checkBundleCompatibility(bundle.data.version);
  importAppData(bundle.data, dispatch);
}

/**
 * Reads a FW sharing bundle, and extracts its contents into a directory where they can be imported
 *
 * @param uri - The file to import
 */
export async function unpackBundle(uri: string): Promise<UnpackedSharingBundle> {
  // We have to decode the file URI because iOS file manager doesn't like encoded uris!
  const fixedUri = Platform.OS === 'android' ? uri : decodeURI(uri);
  const fileName = fixedUri.substring(fixedUri.lastIndexOf('/') + 1);
  const stagingDir = await createTemporaryStagingDirectory();
  const tempZipPath = RNFS.TemporaryDirectoryPath + fileName.replace(/\.[^/.]+$/, '.zip');

  await RNFS.copyFile(fixedUri, tempZipPath);
  await unzip(tempZipPath, stagingDir);

  // We have to remove this otherwise will get an error if the user tries to import same file twice.
  // Also we should probably just clear it up anyways as it takes disk space!
  try {
    await RNFS.unlink(tempZipPath);
  } catch {
    console.warn('Failed to remove zip at tempZipPath');
  }

  const bundleDataUri = `${stagingDir}/${BUNDLE_DATA_FILE_NAME}`;
  const fileContents = await RNFS.readFile(bundleDataUri);
  const bundle = JSON.parse(fileContents);
  return {
    path: stagingDir,
    data: bundle
  };
}
