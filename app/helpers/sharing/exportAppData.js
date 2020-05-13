// @flow

import type { Alert, AlertsState } from 'types/alerts.types';
import type { Area, AreasState } from 'types/areas.types';
import type { Report, ReportsState } from 'types/reports.types';
import type { ExportBundleRequest, SharingBundle } from 'types/sharing.types';
import type { State } from 'types/store.types';
import type { Basemap, BasemapsState } from 'types/basemaps.types';
import type { ContextualLayer, LayersState } from 'types/layers.types';
import type { Route, RouteState } from 'types/routes.types';

import _ from 'lodash';

import { GFW_BASEMAPS } from 'config/constants';
import { queryAlertsSync } from 'helpers/alert-store/queryAlerts';

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
  const alerts = exportAlerts(appState.alerts, request.areaIds);
  const areas = exportAreas(appState.areas, request.areaIds);
  const basemaps = exportBasemaps(appState.basemaps, request.basemapIds);
  const layers = exportLayers(appState.layers, request.layerIds);
  const reports = exportReports(appState.reports, request.reportIds);
  const routes = exportRoutes(appState.routes, request.routeIds);

  console.log("3SC", "Exported alerts", alerts.length);
  console.log("3SC", "Exported areas", areas.length);
  console.log("3SC", "Exported basemaps", basemaps.length);
  console.log("3SC", "Exported layers", layers.length);
  console.log("3SC", "Exported reports", reports.length);
  console.log("3SC", "Exported routes", routes.length);

  return {
    version: APP_DATA_FORMAT_VERSION,
    alerts: alerts,
    areas: areas,
    basemaps: basemaps,
    layers: layers,
    manifest: { layerFiles: [] },
    reports: reports,
    routes: routes
  };
}

/**
 * Extracts any alerts relating to the specified areas
 */
function exportAlerts(alertsState: AlertsState, areaIds: Array<string>): Array<Alert> {
  const resultsForEachArea: Array<Array<Alert>> = areaIds.map(areaId =>
    queryAlertsSync({
      areaId: areaId
    })
  );
  return _.flatten(resultsForEachArea);
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
