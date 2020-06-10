// @flow

import type { ImportBundleRequest, ReportFile, UnpackedSharingBundle } from 'types/sharing.types';
import { trackImportedContent } from 'helpers/analytics';
import { storeLayerFiles } from 'helpers/layer-store/storeLayerFiles';
import { storeReportFiles } from 'helpers/report-store/storeReportFiles';
import queryLayerFiles from 'helpers/layer-store/queryLayerFiles';
import bboxesForFWData from 'helpers/bbox';

export default async function importFileManifest(bundle: UnpackedSharingBundle, request: ImportBundleRequest) {
  await importLayerFiles(bundle, request);
  await importReportFiles(bundle.data.manifest.reportFiles, bundle.path);

  trackImportedContent('bundle', 'gfwbundle', true);
}

/**
 * Imports layer files contained in the unpacked bundle that are relevent to the specified import request
 */
async function importLayerFiles(bundle: UnpackedSharingBundle, request: ImportBundleRequest) {
  const region = bboxesForFWData(request.areas ? bundle.data.areas : [], request.routes ? bundle.data.routes : []);

  let relevantBasemapFiles = [];
  let relevantCustomLayerFiles = [];
  let relevantGfwLayerFiles = [];

  if (request.customBasemaps.metadata) {
    relevantBasemapFiles = await queryLayerFiles(
      'basemap',
      {
        blacklist: [],
        region: request.customBasemaps.files === 'intersecting' ? region : null,
        whitelist: bundle.data.basemaps.map(basemap => basemap.id)
      },
      bundle.path
    );
  }

  if (request.customContextualLayers.metadata) {
    relevantCustomLayerFiles = await queryLayerFiles(
      'contextual_layer',
      {
        blacklist: [],
        region: request.customContextualLayers.files === 'intersecting' ? region : null,
        whitelist: bundle.data.layers.map(layer => layer.id) // TODO: Filter out GFW layers
      },
      bundle.path
    );
  }

  if (request.gfwContextualLayers.metadata) {
    relevantGfwLayerFiles = await queryLayerFiles(
      'contextual_layer',
      {
        blacklist: [],
        region: request.gfwContextualLayers.files === 'intersecting' ? region : null,
        whitelist: bundle.data.layers.map(layer => layer.id) // TODO: filter out user layers
      },
      bundle.path
    );
  }

  const allRelevantLayerFiles = [...relevantBasemapFiles, ...relevantCustomLayerFiles, ...relevantGfwLayerFiles];
  await storeLayerFiles(allRelevantLayerFiles);
}

async function importReportFiles(reportFiles: Array<ReportFile>, importPath: string) {
  const unpackedReportFiles = reportFiles.map(reportFile => ({
    ...reportFile,
    path: `${importPath}${reportFile.path}`
  }));
  await storeReportFiles(unpackedReportFiles);
}
