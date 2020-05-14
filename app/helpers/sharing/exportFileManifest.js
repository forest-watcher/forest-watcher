// @flow

import type { LayerFile, ReportFile, SharingBundleManifest } from 'types/sharing.types';
import type { Area } from 'types/areas.types';
import type { Basemap } from 'types/basemaps.types';
import type { ContextualLayer } from 'types/layers.types';
import type { Report, Template } from 'types/reports.types';
import type { Route } from 'types/routes.types';

import RNFS from 'react-native-fs';

import bboxPolygon from '@turf/bbox-polygon';
import { type BBox2d, featureCollection } from '@turf/helpers';
import queryLayerFiles from 'helpers/layer-store/queryLayerFiles';
import { bbox as routeBbox } from 'helpers/routes';
import { pathWithoutRoot } from 'helpers/layer-store/layerFilePaths';
import { getTemplate, mapFormToQuestions } from 'helpers/forms';

/**
 * Constructs a layer manifest, comprising all layer files for layers that were either explicitly requested in the
 * ExportBundleRequest, or that intersect a specified area or route.
 */
export default async function exportFileManifest(bundle: {
  areas?: Array<Area>,
  basemaps?: Array<Basemap>,
  layers?: Array<ContextualLayer>,
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
  basemaps?: Array<Basemap>,
  layers?: Array<ContextualLayer>,
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
  const areaBBoxes: Array<BBox2d> = (bundle.areas ?? []).map(area => area.geostore?.bbox).filter(Boolean);
  const routeBBoxes: Array<BBox2d> = (bundle.routes ?? []).map(route => routeBbox(route));
  const bboxes = [...areaBBoxes, ...routeBBoxes];
  const regions = bboxes.map(areaBBox => bboxPolygon(areaBBox));
  const region = featureCollection(regions);
  const implicitlyRequestedBasemaps = await queryLayerFiles('basemap', {
    whitelist: [],
    blacklist: basemapIds,
    region: region
  });
  const implicitlyRequestedLayers = await queryLayerFiles('contextual_layer', {
    whitelist: [],
    blacklist: layerIds,
    region: region
  });

  return [
    ...explicitlyRequestedBasemaps,
    ...implicitlyRequestedBasemaps,
    ...explicitlyRequestedLayers,
    ...implicitlyRequestedLayers
  ];
}

async function exportReportFiles(
  reports: Array<Report>,
  templates: { +[string]: Template }
): Promise<Array<ReportFile>> {
  const reportFiles: Array<ReportFile> = [];

  // Loop through all reports looking for blob questions - copy the URI and a reference to the question into an object
  // eslint-disable-next-line no-unused-vars
  for (const report of reports) {
    const template = getTemplate(report, templates);

    if (template) {
      const questions = mapFormToQuestions(template, null);

      let answerIdx = 0;
      // eslint-disable-next-line no-unused-vars
      for (const answer of report.answers) {
        const question = questions[answer.questionName];
        if (question && question.type === 'blob' && answer.value) {
          const uri = answer.value;
          const fileInfo = await RNFS.stat(uri);
          reportFiles.push({
            uri,
            reportName: report.reportName,
            answerIndex: answerIdx,
            size: parseInt(fileInfo.size)
          });
        }
        ++answerIdx;
      }
    }
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
    path: pathWithoutRoot(file.path),
    polygon: null
  }));
}
