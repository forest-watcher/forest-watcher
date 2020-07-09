// @flow

import type {
  ImportBundleRequest,
  LayerFile,
  LayerImportStrategy,
  ReportFile,
  SharingBundle,
  UnpackedSharingBundle
} from 'types/sharing.types';
import { storeLayerFiles } from 'helpers/layer-store/storeLayerFiles';
import { storeReportFiles } from 'helpers/report-store/storeReportFiles';
import { isLayerFileIntersectingRegion } from 'helpers/layer-store/queryLayerFiles';
import bboxesForFWData from 'helpers/bbox';
import { isCustomBasemapFile, isCustomContextualLayerFile, isGfwContextualLayerFile } from 'helpers/layerTypes';

export default async function importFileManifest(bundle: UnpackedSharingBundle, request: ImportBundleRequest) {
  await importLayerFiles(bundle, request);
  await importReportFiles(bundle, request);
}

/**
 * Returns a subset of the layer files contained in a bundle that are relevant to the specified import request
 */
export function filterRelevantLayerFiles(bundle: SharingBundle, request: ImportBundleRequest): Array<LayerFile> {
  const allLayerFiles = bundle.manifest.layerFiles;
  const region = bboxesForFWData(request.areas ? bundle.areas : [], request.routes ? bundle.routes : []);

  // Inner helper fn to avoid duplicate logic
  const relevantFilesFn = (importStrategy: LayerImportStrategy, predicate: LayerFile => boolean): Array<LayerFile> => {
    return importStrategy.metadata
      ? allLayerFiles
          .filter(predicate)
          .filter(layerFile => importStrategy.files === 'all' || isLayerFileIntersectingRegion(layerFile, region))
      : [];
  };

  const relevantBasemapFiles = relevantFilesFn(request.customBasemaps, isCustomBasemapFile);
  const relevantCustomLayerFiles = relevantFilesFn(request.customContextualLayers, isCustomContextualLayerFile);
  const relevantGfwLayerFiles = relevantFilesFn(request.gfwContextualLayers, isGfwContextualLayerFile);

  return [...relevantBasemapFiles, ...relevantCustomLayerFiles, ...relevantGfwLayerFiles];
}

export function filterRelevantReportFiles(bundle: SharingBundle, request: ImportBundleRequest): Array<ReportFile> {
  return request.reports ? bundle.manifest.reportFiles : [];
}

/**
 * Imports layer files contained in the unpacked bundle that are relevent to the specified import request
 */
async function importLayerFiles(bundle: UnpackedSharingBundle, request: ImportBundleRequest) {
  const relevantLayerFiles = filterRelevantLayerFiles(bundle.data, request);
  const unpackedReportFiles = relevantLayerFiles.map(layerFile => ({
    ...layerFile,
    path: `${bundle.path}${layerFile.path}`
  }));
  await storeLayerFiles(unpackedReportFiles, 'move');
}

async function importReportFiles(bundle: UnpackedSharingBundle, request: ImportBundleRequest) {
  const relevantReportFiles = filterRelevantReportFiles(bundle.data, request);
  const unpackedReportFiles = relevantReportFiles.map(reportFile => ({
    ...reportFile,
    path: `${bundle.path}${reportFile.path}`
  }));
  await storeReportFiles(unpackedReportFiles);
}
