// @flow
import type { ExportBundleRequest, UnpackedSharingBundle } from 'types/sharing.types';
import FWError from 'helpers/fwError';
import deleteStagedBundle from 'helpers/sharing/deleteStagedBundle';

/**
 * Version number of the bundles created using the functions in this file
 *
 * Should be incremented whenever the format changes
 */
export const BUNDLE_FORMAT_VERSION: number = 1;

/**
 * Exports a subset of app data to a standalone file that can be imported into other instances of the FW app
 *
 * @param request - The request defining which data should be exported
 */
export default async function exportBundle(request: ExportBundleRequest): Promise<File> {
  const stagedBundle = await stageBundle(request);
  const bundleFile = await packageBundle(stagedBundle);
  deleteStagedBundle(stagedBundle);
  return bundleFile;
}

/**
 * Packs a bundle's files into a single compressed archive. Packed files are left on disk.
 *
 * @param bundle - The staged bundle to pack
 */
export function packageBundle(bundle: UnpackedSharingBundle): Promise<File> {
  throw new FWError('Not yet implemented');
}

/**
 * Stages all the files and data required to export a bundle in a local directory, without yet packing them
 *
 * @param request - The request defining which data should be exported
 */
export function stageBundle(request: ExportBundleRequest): Promise<UnpackedSharingBundle> {
  throw new FWError('Not yet implemented');
}
