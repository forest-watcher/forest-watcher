// @flow

import type { Route, LocationPoint } from 'types/routes.types';
import turfBbox from '@turf/bbox';
import { type BBox2d, lineString as turfLineString } from '@turf/helpers';

export function bbox(route: Route): BBox2d {
  const routePoints = [...route.locations, route.destination];
  const lineString = turfLineString(
    routePoints.map((item: Location | LocationPoint) => [item.longitude, item.latitude])
  );
  return turfBbox(lineString);
}
