// @flow
import type { Dispatch } from 'types/store.types';
import type { ImportBundleResult, UnpackedSharingBundle } from 'types/sharing.types';
import FWError from 'helpers/fwError';
import deleteStagedBundle from 'helpers/sharing/deleteStagedBundle';
import { SAVE_AREA_COMMIT } from 'redux-modules/areas';

/**
 * Imports a FW sharing bundle into the app
 *
 * @param file - The file to import
 * @param dispatch - Redux dispatch function used to emit actions to add data to the app
 */
export default async function importBundle(file: File, dispatch: Dispatch): Promise<ImportBundleResult> {
  const unpackedBundle = await unpackBundle(file);
  const importResult = await importStagedBundle(unpackedBundle, dispatch);
  deleteStagedBundle(unpackedBundle);
  return importResult;
}

function checkBundleCompatibility(version: number) {
  throw new FWError('Not yet implemented');
}

/**
 * Imports the data held in an unpacked bundle into the app
 *
 * @param bundle - The bundle - already unpacked - whose data should be imported
 * @param dispatch - Redux dispatch function used to emit actions to add data to the app
 */
export function importStagedBundle(bundle: UnpackedSharingBundle, dispatch: Dispatch): Promise<ImportBundleResult> {
  checkBundleCompatibility(bundle.data.version);

  bundle.data.areas.forEach(area => {
    // TODO: Handle area with same ID in reducer??
    dispatch({
      type: SAVE_AREA_COMMIT,
      payload: area
    });
  });

  throw new FWError('Not yet implemented');
}

/**
 * Reads a FW sharing bundle, and extracts its contents into a directory where they can be imported
 *
 * @param file - The file to import
 */
export function unpackBundle(file: File): Promise<UnpackedSharingBundle> {
  throw new FWError('Not yet implemented');
}
