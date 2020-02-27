// @flow
import type { State } from 'types/store.types';
import type { ExportBundleRequest, SharingBundle, UnpackedSharingBundle } from 'types/sharing.types';
import RNFS from 'react-native-fs';
import { zip } from 'react-native-zip-archive';

import deleteStagedBundle from 'helpers/sharing/deleteStagedBundle';

/**
 * Version number of the bundles created using the functions in this file
 *
 * Should be incremented whenever the format changes
 */
export const BUNDLE_FORMAT_VERSION: number = 1;

/**
 * Extension of the final bundle
 */
export const BUNDLE_FILE_EXTENSION: string = '.gfw.bundle';

/**
 * Directory on the device where the bundle will be prepared
 */
export const BUNDLE_DEFAULT_STAGING_DIR: string = RNFS.TemporaryDirectoryPath;

/**
 * The name of the data file held in the root of a bundle archive
 */
export const BUNDLE_DATA_FILE_NAME: string = 'bundle.json';

/**
 * Exports a subset of app data to a standalone file that can be imported into other instances of the FW app
 *
 * @param request - The request defining which data should be exported
 */
export default async function exportBundle(request: ExportBundleRequest, appState: State): Promise<string> {
  const stagedBundle = await stageBundle(request, appState);
  const bundleFile = await packageBundle(stagedBundle);
  deleteStagedBundle(stagedBundle);
  return bundleFile;
}

/**
 * Packs a bundle's files into a single compressed archive. Packed files are left on disk.
 *
 * @param bundle - The staged bundle to pack
 */
export async function packageBundle(bundle: UnpackedSharingBundle): Promise<string> {
  const outputFilePath = `${bundle.path}${BUNDLE_FILE_EXTENSION}`;
  return await zip(bundle.path, outputFilePath);
}

/**
 * Stages all the files and data required to export a bundle in a local directory, without yet packing them
 *
 * @param request - The request defining which data should be exported
 */
export async function stageBundle(request: ExportBundleRequest, appState: State): Promise<UnpackedSharingBundle> {
  const areaIds = request.areaIds;
  const areas = areaIds.map(id => appState.areas.data.find(area => area.id === id)).filter(Boolean);

  const outputPath = `${BUNDLE_DEFAULT_STAGING_DIR}/bundle-${Date.now().toString()}`;

  const bundle: SharingBundle = {
    version: BUNDLE_FORMAT_VERSION,
    areas: areas,
    reports: []
  };
  await writeBundle(bundle, outputPath);

  return {
    path: outputPath,
    data: bundle
  };
}

async function writeBundle(bundle: SharingBundle, outputPath: string): Promise<string> {
  const outputFile = `${outputPath}/${BUNDLE_DATA_FILE_NAME}`;
  await RNFS.mkdir(outputPath);

  const outputData = JSON.stringify(bundle);
  await RNFS.writeFile(outputFile, outputData);

  return outputFile;
}
