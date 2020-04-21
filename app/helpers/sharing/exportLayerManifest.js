// @flow

import type { ExportBundleRequest, LayerManifest } from 'types/sharing.types';
import type { Area } from 'types/areas.types';
import type { Route } from 'types/routes.types';

import bboxPolygon from '@turf/bbox-polygon';
import { type BBox2d, featureCollection } from '@turf/helpers';
import queryLayerFiles from 'helpers/layer-store/queryLayerFiles';
import { bbox as routeBbox } from 'helpers/routes';
import _ from 'lodash';
import { pathWithoutRoot } from 'helpers/layer-store/layerFilePaths';

/**
 * Constructs a layer manifest, comprising all layer files for layers that were either explicitly requested in the
 * ExportBundleRequest, or that intersect a specified area or route.
 */
export default async function exportLayerManifest(
  request: ExportBundleRequest,
  areas: Array<Area>,
  routes: Array<Route>
): Promise<LayerManifest> {
  // First query ALL the files for any basemap / layer that has been explicitly requested
  const explicitlyRequestedBasemaps =
    request.basemapIds.length > 0
      ? await queryLayerFiles('basemap', {
          whitelist: request.basemapIds,
          blacklist: []
        })
      : {};
  const explicitlyRequestedLayers =
    request.layerIds.length > 0
      ? await queryLayerFiles('contextual_layer', {
          whitelist: request.layerIds,
          blacklist: []
        })
      : {};

  // Next, for any basemap / layer that HASN'T been explicitly requested, but that intersects an explicitly requested
  // route or area, request the files that lie within the intersection
  const areaBBoxes: Array<BBox2d> = areas.map(area => area.geostore?.bbox).filter(Boolean);
  const routeBBoxes: Array<BBox2d> = routes.map(route => routeBbox(route));
  const bboxes = [...areaBBoxes, ...routeBBoxes];
  const regions = bboxes.map(areaBBox => bboxPolygon(areaBBox));
  const region = featureCollection(regions);
  const implicitlyRequestedBasemaps = await queryLayerFiles('basemap', {
    whitelist: [],
    blacklist: request.basemapIds,
    region: region
  });
  const implicitlyRequestedLayers = await queryLayerFiles('contextual_layer', {
    whitelist: [],
    blacklist: request.layerIds,
    region: region
  });

  return {
    basemaps: {
      ...explicitlyRequestedBasemaps,
      ...implicitlyRequestedBasemaps
    },
    layers: {
      ...explicitlyRequestedLayers,
      ...implicitlyRequestedLayers
    }
  };
}

/**
 * Create a sanitised manifest that removes the path roots and polygons from each file. This sanitised manifest is suitable
 * for inclusion in an actual bundle, because its size is minimized and it makes no references to the origin device.
 */
export function sanitiseLayerManifest(manifest: LayerManifest): LayerManifest {
  return {
    basemaps: _.mapValues(manifest.basemaps, files =>
      files.map(file => ({
        polygon: null,
        uri: pathWithoutRoot(file.uri)
      }))
    ),
    layers: _.mapValues(manifest.layers, files =>
      files.map(file => ({
        polygon: null,
        uri: pathWithoutRoot(file.uri)
      }))
    )
  };
}
