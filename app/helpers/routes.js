// @flow

import type { Route } from 'types/routes.types';
import turf, { type BBox2d } from '@turf/helpers';

export function bbox(route: Route): BBox2d {
  const routePoints = [...route.locations, route.destination];
  const lineString = turf.lineString(routePoints.map(item => [item.longitude, item.latitude]));
  return turf.bbox(lineString);
}
