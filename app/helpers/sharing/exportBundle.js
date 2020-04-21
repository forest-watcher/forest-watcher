// @flow
import type { State } from 'types/store.types';
import type { ExportBundleRequest, SharingBundle, UnpackedSharingBundle } from 'types/sharing.types';
import RNFS from 'react-native-fs';
import { zip } from 'react-native-zip-archive';

import deleteStagedBundle from 'helpers/sharing/deleteStagedBundle';
import exportAppData, { exportBasemaps, exportLayers } from 'helpers/sharing/exportAppData';
import exportLayerManifest from 'helpers/sharing/exportLayerManifest';

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
export default async function exportBundle(appState: State, request: ExportBundleRequest): Promise<string> {
  const explicitBundleData = exportAppData(appState, request);
  const layerManifest = await exportLayerManifest(request, explicitBundleData.areas, explicitBundleData.routes);
  const finalBundleData = {
    ...explicitBundleData,
    basemaps: exportBasemaps(appState.basemaps, Object.keys(layerManifest.basemaps)),
    layers: exportLayers(appState.layers, Object.keys(layerManifest.layers))
  };

  const stagedBundle = await stageBundle(finalBundleData);
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
export async function stageBundle(bundle: SharingBundle): Promise<UnpackedSharingBundle> {
  const outputPath = `${BUNDLE_DEFAULT_STAGING_DIR}/bundle-${Date.now().toString()}`;
  const outputFile = `${outputPath}/${BUNDLE_DATA_FILE_NAME}`;

  await RNFS.mkdir(outputPath);

  // Copy across all associated files in the manifest
   bundle.manifest.basemaps;


  const outputData = JSON.stringify(bundle);

  // Create the staging directory and write the bundle data file
  await RNFS.writeFile(outputFile, outputData);

  return {
    path: outputPath,
    data: bundle
  };
}
