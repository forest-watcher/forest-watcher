// @flow
import type { Dispatch } from 'types/store.types';
import type { ImportBundleResult, UnpackedSharingBundle } from 'types/sharing.types';

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
 * @param file - The file to import
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
    console.warn('3SC', 'Bundle created using a future app version, proceed with caution');
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
 * @param file - The file to import
 */
export async function unpackBundle(uri: string): Promise<UnpackedSharingBundle> {
  const stagingDir = await createTemporaryStagingDirectory();
  await unzip(uri, stagingDir);

  const bundleDataUri = `${stagingDir}/${BUNDLE_DATA_FILE_NAME}`;
  const fileContents = await RNFS.readFile(bundleDataUri);
  const bundle = JSON.parse(fileContents);
  return {
    path: stagingDir,
    data: bundle
  };
}
