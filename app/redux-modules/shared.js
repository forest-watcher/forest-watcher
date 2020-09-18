// @flow
import type { Area } from 'types/areas.types';
import type { Route } from 'types/routes.types';

// Defines a list of shared action types, that may be emitted but then
// observed by various different reducers.
//
// This removes the possibility of require cycles that could have
// unintended side effects
export const RETRY_SYNC = 'app/RETRY_SYNC';

export const IMPORT_LAYER_REQUEST = 'layers/IMPORT_LAYER_REQUEST';
export const IMPORT_LAYER_PROGRESS = 'layers/IMPORT_LAYER_PROGRESS';
export const IMPORT_LAYER_AREA_COMPLETED = 'layers/IMPORT_LAYER_AREA_COMPLETED';
export const IMPORT_LAYER_COMMIT = 'layers/IMPORT_LAYER_COMMIT';

export const RESET_REGION_PROGRESS = 'layers/RESET_REGION_PROGRESS';

/**
 * getAreaById - given a list of areas, attempts to find the area
 * with the same ID as the one provided.
 *
 * @param {Array<Area>} areas
 * @param {string} areaId
 *
 * @returns {?Area} the matching area, if it exists.
 */
export function getAreaById(areas: Array<Area>, areaId: string): ?Area {
  const area = areas.find(areaData => areaData.id === areaId);
  return area ? { ...area } : null;
}

/**
 * getRouteById - given a list of routes, attempts to find the route
 * with the same ID as the one provided.
 *
 * @param {Array<Route>} routes
 * @param {string} routeId
 *
 * @returns {?Route} the matching route, if it exists.
 */
export function getRouteById(routes: Array<Route>, routeId: string): ?Route {
  const route = routes.find(route => route.id === routeId);
  return route ? { ...route } : null;
}
