// @flow

import type { Route } from 'types/routes.types';
import turfBbox from '@turf/bbox';
import { type BBox2d, lineString as turfLineString } from '@turf/helpers';

export function bbox(route: Route): BBox2d {
  const routePoints = [...route.locations, route.destination];
  const lineString = turfLineString(routePoints.map(item => [item.longitude, item.latitude]));
  return turfBbox(lineString);
}
