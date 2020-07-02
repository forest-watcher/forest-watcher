// @flow

import type { LayerFile, ReportFile, SharingBundleManifest } from 'types/sharing.types';
import type { Area } from 'types/areas.types';
import type { Layer } from 'types/layers.types';
import type { Report, Template } from 'types/reports.types';
import type { Route } from 'types/routes.types';

import queryLayerFiles from 'helpers/layer-store/queryLayerFiles';
import bboxForFWData from 'helpers/bbox';
import { pathWithoutRoot } from 'helpers/fileManagement';
import { layerRootDir } from 'helpers/layer-store/layerFilePaths';
import { reportRootDir } from 'helpers/report-store/reportFilePaths';
import queryReportFiles from 'helpers/report-store/queryReportFiles';

/**
 * Constructs a layer manifest, comprising all layer files for layers that were either explicitly requested in the
 * ExportBundleRequest, or that intersect a specified area or route.
 */
export default async function exportFileManifest(bundle: {
  areas?: Array<Area>,
  basemaps?: Array<Layer>,
  layers?: Array<Layer>,
  reports?: Array<Report>,
  routes?: Array<Route>,
  templates?: { +[string]: Template }
}): Promise<SharingBundleManifest> {
  const layerFiles = await exportLayerFiles(bundle);
  const reportFiles = await exportReportFiles(bundle.reports ?? [], bundle.templates ?? {});

  return {
    layerFiles: layerFiles,
    reportFiles: reportFiles
  };
}

async function exportLayerFiles(bundle: {
  areas?: Array<Area>,
  basemaps?: Array<Layer>,
  layers?: Array<Layer>,
  routes?: Array<Route>
}) {
  const basemapIds = (bundle.basemaps ?? []).map(basemap => basemap.id);
  const layerIds = (bundle.layers ?? []).map(layer => layer.id);

  // First query ALL the files for any basemap / layer that has been explicitly requested
  const explicitlyRequestedBasemaps =
    basemapIds.length > 0
      ? await queryLayerFiles('basemap', {
          whitelist: basemapIds,
          blacklist: []
        })
      : [];
  const explicitlyRequestedLayers =
    layerIds.length > 0
      ? await queryLayerFiles('contextual_layer', {
          whitelist: layerIds,
          blacklist: []
        })
      : [];

  // Next, for any basemap / layer that HASN'T been explicitly requested, but that intersects an explicitly requested
  // route or area, request the files that lie within the intersection
  const region = bboxForFWData(bundle.areas ?? [], bundle.routes ?? []);
  const implicitlyRequestedBasemaps =
    region.features.length > 0
      ? await queryLayerFiles('basemap', {
          whitelist: [],
          blacklist: basemapIds,
          region: region
        })
      : [];
  const implicitlyRequestedLayers =
    region.features.length > 0
      ? await queryLayerFiles('contextual_layer', {
          whitelist: [],
          blacklist: layerIds,
          region: region
        })
      : [];

  return [
    ...explicitlyRequestedBasemaps,
    ...implicitlyRequestedBasemaps,
    ...explicitlyRequestedLayers,
    ...implicitlyRequestedLayers
  ];
}

/**
 * Assemble a manifest of external files relating to the specified reports.
 *
 * Specifically, this will check each report for attachments and return the locations of those attachments.
 */
async function exportReportFiles(
  reports: Array<Report>,
  templates: { +[string]: Template }
): Promise<Array<ReportFile>> {
  const reportFiles: Array<ReportFile> = [];

  // Loop through all reports looking for blob questions - copy the URI and a reference to the question into an object
  // eslint-disable-next-line no-unused-vars
  for (const report of reports) {
    const queriedFiles = await queryReportFiles({
      reportName: report.reportName
    });
    reportFiles.push(...queriedFiles);
  }

  return reportFiles;
}

/**
 * Create a sanitised manifest that removes the path roots and polygons from each file. This sanitised manifest is suitable
 * for inclusion in an actual bundle, because its size is minimized and it makes no references to the origin device.
 */
export function sanitiseLayerFilesForBundle(files: Array<LayerFile>): Array<LayerFile> {
  return files.map(file => ({
    ...file,
    path: pathWithoutRoot(file.path, layerRootDir()),
    polygon: null
  }));
}

/**
 * Create a sanitised manifest that removes the path roots and polygons from each file. This sanitised manifest is suitable
 * for inclusion in an actual bundle, because its size is minimized and it makes no references to the origin device.
 */
export function sanitiseReportFilesForBundle(files: Array<ReportFile>): Array<ReportFile> {
  return files.map(file => ({
    ...file,
    path: pathWithoutRoot(file.path, reportRootDir())
  }));
}
