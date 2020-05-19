// @flow
import type { State } from 'types/store.types';
import type { ExportBundleRequest, SharingBundle, UnpackedSharingBundle } from 'types/sharing.types';

import _ from 'lodash';
import RNFS from 'react-native-fs';
import { zip } from 'react-native-zip-archive';

import deleteStagedBundle from 'helpers/sharing/deleteStagedBundle';
import exportAppData, { exportBasemaps, exportLayers } from 'helpers/sharing/exportAppData';
import exportFileManifest, { sanitiseLayerFilesForBundle } from 'helpers/sharing/exportFileManifest';
import { storeLayerFiles } from 'helpers/layer-store/storeLayerFiles';
import createTemporaryStagingDirectory from 'helpers/sharing/createTemporaryStagingDirectory';

/**
 * Extension of the final bundle
 */
export const BUNDLE_FILE_EXTENSION: string = '.gfwbundle';

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
  const fileManifest = await exportFileManifest({ ...explicitBundleData });

  // The file manifest will now include some implicitly imported basemaps and layers, which we need to fetch the
  // metadata for
  const implicitlyIncludedBasemapIds: Array<string> = fileManifest.layerFiles
    .filter(file => file.type === 'basemap')
    .map(file => file.layerId);
  const implicitlyIncludedLayerIds: Array<string> = fileManifest.layerFiles
    .filter(file => file.type === 'contextual_layer')
    .map(file => file.layerId);
  const allBasemapIds: Array<string> = _.uniq([...request.basemapIds, ...implicitlyIncludedBasemapIds]);
  const allLayerIds: Array<string> = _.uniq([...request.layerIds, ...implicitlyIncludedLayerIds]);
  const finalBundleData = {
    ...explicitBundleData,
    basemaps: exportBasemaps(appState.basemaps, allBasemapIds),
    layers: exportLayers(appState.layers, allLayerIds),
    manifest: fileManifest
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
  const outputPath = await createTemporaryStagingDirectory();

  // Stage manifest files and then clean the manifest for the bundle
  await storeLayerFiles(bundle.manifest.layerFiles, outputPath);

  // Write the bundle data file
  const sanitisedBundle = {
    ...bundle,
    manifest: {
      ...bundle.manifest,
      layerFiles: sanitiseLayerFilesForBundle(bundle.manifest.layerFiles)
    }
  };
  const outputFile = `${outputPath}/${BUNDLE_DATA_FILE_NAME}`;
  const outputData = JSON.stringify(sanitisedBundle);
  await RNFS.writeFile(outputFile, outputData);

  return {
    path: outputPath,
    data: bundle
  };
}
