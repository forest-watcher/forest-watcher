// @flow

import type {
  ImportBundleRequest,
  LayerFile,
  ReportFile,
  SharingBundle,
  SharingBundleManifest
} from 'types/sharing.types';
import type { Area } from 'types/areas.types';
import type { MapContent } from 'types/layers.types';
import type { Report, Template } from 'types/reports.types';
import type { Route } from 'types/routes.types';
import exportFileManifest from 'helpers/sharing/exportFileManifest';
import { filterRelevantLayerFiles, filterRelevantReportFiles } from 'helpers/sharing/importFileManifest';

/**
 * Calculates the size in bytes of a sharing bundle, based on what will be included in it
 */
export default async function calculateBundleSize(bundle: {
  areas?: Array<Area>,
  basemaps?: Array<MapContent>,
  layers?: Array<MapContent>,
  reports?: Array<Report>,
  routes?: Array<Route>,
  templates?: { +[string]: Template }
}): Promise<number> {
  const manifest = await exportFileManifest(bundle);
  const manifestSize = manifestBundleSize(manifest);
  const metaSize = JSON.stringify(bundle).length; // really rough approximation of the bundle data file size
  return manifestSize + metaSize;
}

/**
 * Calculates the size in bytes of a subset of a sharing bundle, based on what the user has requested from it
 */
export function calculateImportBundleSize(bundle: SharingBundle, request: ImportBundleRequest): number {
  const relevantLayerFiles = filterRelevantLayerFiles(bundle, request);
  const relevantReportFiles = filterRelevantReportFiles(bundle, request);
  const manifestSize = manifestBundleSize({
    ...bundle.manifest,
    layerFiles: relevantLayerFiles,
    reportFiles: relevantReportFiles
  });

  const filteredBundle: SharingBundle = {
    alerts: [],
    areas: request.areas ? bundle.areas : [],
    basemaps: request.customBasemaps.metadata ? bundle.basemaps : [],
    layers: request.customContextualLayers.metadata || request.gfwContextualLayers.metadata ? bundle.layers : [],
    manifest: {
      layerFiles: [],
      reportFiles: []
    },
    reports: request.reports ? bundle.reports : [],
    routes: request.routes ? bundle.routes : [],
    templates: request.reports ? bundle.templates : {},
    timestamp: bundle.timestamp,
    version: bundle.version
  };
  const metaSize = JSON.stringify(filteredBundle).length; // really rough approximation of the bundle data file size
  return manifestSize + metaSize;
}

/**
 * Returns a rough approximation of the export file size for a given export layer manifest
 */
export function manifestBundleSize(manifest: SharingBundleManifest): number {
  let size = 0;
  manifest.layerFiles.forEach((file: LayerFile) => {
    if (!isNaN(file.size)) {
      size += file.size;
    }
  });
  manifest.reportFiles.forEach((file: ReportFile) => {
    if (!isNaN(file.size)) {
      size += file.size;
    }
  });
  return size;
}
