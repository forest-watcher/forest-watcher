// @flow
import type { State } from 'types/store.types';
import type {
  ExportBundleRequest,
  LayerFile,
  LayerManifest,
  SharingBundle,
  UnpackedSharingBundle
} from 'types/sharing.types';

import _ from 'lodash';
import RNFS from 'react-native-fs';
import { zip } from 'react-native-zip-archive';

import deleteStagedBundle from 'helpers/sharing/deleteStagedBundle';
import exportAppData, { exportBasemaps, exportLayers } from 'helpers/sharing/exportAppData';
import exportLayerManifest, { sanitiseLayerManifest } from 'helpers/sharing/exportLayerManifest';
import { pathWithoutRoot } from 'helpers/layer-store/layerFilePaths';

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
    layers: exportLayers(appState.layers, Object.keys(layerManifest.layers)),
    manifest: layerManifest
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
  await RNFS.mkdir(outputPath);

  // Stage manifest files and then clean the manifest for the bundle
  await stageLayerManifest(outputPath, bundle.manifest);
  const sanitisedManifest = sanitiseLayerManifest(bundle.manifest);
  const sanitisedBundle = {
    ...bundle,
    manifest: sanitisedManifest
  };

  // Write the bundle data file
  const outputFile = `${outputPath}/${BUNDLE_DATA_FILE_NAME}`;
  const outputData = JSON.stringify(sanitisedBundle);
  await RNFS.writeFile(outputFile, outputData);

  return {
    path: outputPath,
    data: bundle
  };
}

/**
 * Copy files referenced in a layer manifest across to the specified directory
 */
export async function stageLayerManifest(outputPath: string, manifest: LayerManifest) {
  // Copy across all associated files in the manifest into the staging directory
  const allLayerFiles: Array<LayerFile> = [
    ..._.flatten(Object.keys(manifest.basemaps).map(key => manifest.basemaps[key])),
    ..._.flatten(Object.keys(manifest.layers).map(key => manifest.layers[key]))
  ];

  // eslint-disable-next-line no-unused-vars
  for (const file of allLayerFiles) {
    const destinationUri = `${outputPath}${pathWithoutRoot(file.uri)}`;
    const destinationPath = destinationUri
      .split('/')
      .slice(0, -1)
      .join('/');
    await RNFS.mkdir(destinationPath);
    await RNFS.copyFile(file.uri, destinationUri); // copy sequentially
  }
}
