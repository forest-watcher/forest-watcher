// @flow

import type { ExportBundleRequest, LayerManifest } from 'types/sharing.types';
import type { Area } from 'types/areas.types';
import type { Route } from 'types/routes.types';
import type { BBox2d } from '@turf/helpers';

import bboxPolygon from '@turf/bbox-polygon';
import queryLayerFiles from 'helpers/layer-store/queryLayerFiles';
import { bbox as routeBbox } from 'helpers/routes';

/**
 * Constructs a layer manifest, comprising all layer files for layers that were either explicitly requested in the
 * ExportBundleRequest, or that intersect a specified area or route.
 */
export default function exportLayerManifest(
  request: ExportBundleRequest,
  areas: Array<Area>,
  routes: Array<Route>
): LayerManifest {
  // First query ALL the files for any basemap / layer that has been explicitly requested
  const explicitlyRequestedBasemaps = queryLayerFiles({ whitelist: request.basemapIds, blacklist: [], region: [] });
  const explicitlyRequestedLayers = queryLayerFiles({ whitelist: request.layerIds, blacklist: [], region: [] });

  // Next, for any basemap / layer that HASN'T been explicitly requested, but that intersects an explicitly requested
  // route or area, request the files that lie within the intersection
  const areaBBoxes: Array<BBox2d> = areas.map(area => area.geostore?.bbox).filter(Boolean);
  const routeBBoxes: Array<BBox2d> = routes.map(route => routeBbox(route));
  const bboxes = [...areaBBoxes, ...routeBBoxes];
  const regions = bboxes.map(areaBBox => bboxPolygon(areaBBox));
  const implicitlyRequestedBasemaps = queryLayerFiles({
    whitelist: [],
    blacklist: request.basemapIds,
    region: regions
  });
  const implicitlyRequestedLayers = queryLayerFiles({
    whitelist: [],
    blacklist: request.layerIds,
    region: regions
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
