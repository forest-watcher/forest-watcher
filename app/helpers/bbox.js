// @flow

import type { Area } from 'types/areas.types';
import type { Coordinates } from 'types/common.types';

import type { Route, LocationPoint } from 'types/routes.types';
import turfBbox from '@turf/bbox';
import {
  type BBox2d,
  type FeatureCollection,
  type Polygon,
  featureCollection,
  lineString as turfLineString
} from '@turf/helpers';
import bboxPolygon from '@turf/bbox-polygon';

/**
 * Returns the bboxes enclosing the specified areas and routes. Each bbox is represented as a Polygon in a FeatureCollection.
 */
export default function bboxesForFWData(areas: Array<Area>, routes: Array<Route>): FeatureCollection<Polygon> {
  const areaBBoxes: Array<BBox2d> = areas.map(area => bboxForArea(area)).filter(Boolean);
  const routeBBoxes: Array<BBox2d> = routes
    .map(route => {
      try {
        return bboxForRoute(route);
      } catch {
        // The bbox couldn't be generated, the route likely has zero locations and can't be shared.
        return null;
      }
    })
    .filter(bbox => bbox !== null);
  const bboxes = [...areaBBoxes, ...routeBBoxes];
  const regions = bboxes.map(areaBBox => bboxPolygon(areaBBox));
  return featureCollection(regions);
}

/**
 * Returns the minimal bbox enclosing the specified area
 */
// eslint-disable-next-line import/no-unused-modules
export function bboxForArea(area: Area): ?BBox2d {
  return area.geostore?.bbox;
}

/**
 * Returns the minimal bbox enclosing the specified route
 */
export function bboxForRoute(route: Route): BBox2d {
  const routePoints = [...route.locations, route.destination];
  const lineString = turfLineString(
    routePoints.map((item: Coordinates | LocationPoint) => [item.longitude, item.latitude])
  );
  return turfBbox(lineString);
}
