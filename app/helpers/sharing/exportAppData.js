// @flow

import type { Alert, AlertsState } from 'types/alerts.types';
import type { Area, AreasState } from 'types/areas.types';
import type { Report, ReportsState } from 'types/reports.types';
import type { ExportBundleRequest, SharingBundle } from 'types/sharing.types';
import type { State } from 'types/store.types';
import type { Basemap, BasemapsState } from 'types/basemaps.types';
import type { ContextualLayer, LayersState } from 'types/layers.types';
import type { Route, RouteState } from 'types/routes.types';
import type { BBox2d, Feature, Polygon } from '@turf/helpers';
import bboxPolygon from '@turf/bbox-polygon';

import { GFW_BASEMAPS } from 'config/constants';

/**
 * Version number of the bundles created using the functions in this file
 *
 * Should be incremented whenever the format changes
 */
export const APP_DATA_FORMAT_VERSION: number = 1;

/**
 * Export selected items from Redux state
 *
 * @param request
 * @param appState
 */
export default function exportAppData(appState: State, request: ExportBundleRequest): SharingBundle {
  const areas = exportAreas(appState.areas, request.areaIds);
  const basemaps = exportBasemaps(appState.basemaps, request.basemapIds);
  const layers = exportLayers(appState.layers, request.layerIds);
  const reports = exportReports(appState.reports, request.reportIds);
  const routes = exportRoutes(appState.routes, request.routeIds);

  // Also include any alerts that intersect the areas
  const areaBBoxes: Array<BBox2d> = areas.map(area => area.geostore?.bbox).filter(Boolean);
  const areaRegions = areaBBoxes.map(areaBBox => bboxPolygon(areaBBox));
  const alerts = exportAlerts(appState.alerts, areaRegions);

  return {
    version: APP_DATA_FORMAT_VERSION,
    alerts: alerts,
    areas: areas,
    basemaps: basemaps,
    layers: layers,
    manifest: { basemaps: {}, layers: {} },
    reports: reports,
    routes: routes
  };
}

/**
 * Extracts any alerts from state intersecting the specified geographic regions
 */
function exportAlerts(alertsState: AlertsState, regions: Array<Feature<Polygon>>): Array<Alert> {
  // TODO: Filter by region in a forthcoming PR
  return [];
}

/**
 * Extracts any areas from state with IDs matching those in areaIds
 */
function exportAreas(areasState: AreasState, areaIds: Array<string>): Array<Area> {
  return areasState.data.filter(area => areaIds.includes(area.id));
}

/**
 * Extracts any basemap info from state for basemaps matching the specified IDs, OR intersecting any of the given regions
 */
export function exportBasemaps(basemapsState: BasemapsState, basemapIds: Array<string>): Array<Basemap> {
  const allBasemaps = [...GFW_BASEMAPS, ...basemapsState.importedBasemaps];
  return allBasemaps.filter(basemap => basemapIds.includes(basemap.id));
}

/**
 * Extracts any layer info from state for layers matching the specified IDs, OR intersecting any of the given regions
 */
export function exportLayers(layersState: LayersState, layerIds: Array<string>): Array<ContextualLayer> {
  return layersState.data.filter(layer => layerIds.includes(layer.id));
}

/**
 * Extracts any reports from state with IDs matching those in reportIds
 */
function exportReports(reportsState: ReportsState, reportIds: Array<string>): Array<Report> {
  return reportIds.map(reportId => reportsState.list[reportId]).filter(Boolean);
}

/**
 * Extracts any routes from state with IDs matching those in routeIds
 */
function exportRoutes(routesState: RouteState, routeIds: Array<string>): Array<Route> {
  const allRoutes = [routesState.activeRoute, ...routesState.previousRoutes, ...routesState.importedRoutes];
  return allRoutes.filter(route => route && routeIds.includes(route.id)).filter(Boolean);
}
