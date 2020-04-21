// @flow

import type { ExportBundleRequest, LayerManifest } from 'types/sharing.types';
import type { Area } from 'types/areas.types';
import type { Route } from 'types/routes.types';

import bboxPolygon from '@turf/bbox-polygon';
import { type BBox2d, featureCollection } from '@turf/helpers';
import queryLayerFiles from 'helpers/layer-store/queryLayerFiles';
import { bbox as routeBbox } from 'helpers/routes';

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
  const explicitlyRequestedBasemaps = await queryLayerFiles('basemap', {
    whitelist: request.basemapIds,
    blacklist: []
  });
  const explicitlyRequestedLayers = await queryLayerFiles('contextual_layer', {
    whitelist: request.layerIds,
    blacklist: []
  });

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
