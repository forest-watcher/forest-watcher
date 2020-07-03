// @flow

import type { Alert } from 'types/alerts.types';
import type { Area } from 'types/areas.types';
import type { ImportBundleRequest, SharingBundle } from 'types/sharing.types';
import type { Dispatch } from 'types/store.types';
import type { Route } from 'types/routes.types';
import type { Report, Template } from 'types/reports.types';
import type { Layer } from 'types/layers.types';
import storeAlerts from 'helpers/alert-store/storeAlerts';
import { SAVE_AREA_COMMIT } from 'redux-modules/areas';
import { IMPORT_LAYER_REQUEST, IMPORT_LAYER_COMMIT } from 'redux-modules/layers';
import { IMPORT_ROUTE } from 'redux-modules/routes';
import { IMPORT_REPORT, IMPORT_TEMPLATE } from 'redux-modules/reports';

export default function importAppData(bundle: SharingBundle, request: ImportBundleRequest, dispatch: Dispatch) {
  if (request.areas) {
    importAlerts(bundle.alerts);
    importAreas(bundle.areas, dispatch);
  }

  if (request.routes) {
    importRoutes(bundle.routes, dispatch);
  }

  if (request.reports) {
    // Import templates before reports just in case, as the latter is dependent on the former
    importTemplates(Object.keys(bundle.templates).map(key => bundle.templates[key]), dispatch);
    importReports(bundle.reports, dispatch);
  }

  if (request.customBasemaps.metadata) {
    importBasemaps(bundle.basemaps, dispatch);
  }

  if (request.customContextualLayers.metadata) {
    importLayers(bundle.layers, dispatch);
  }

  if (request.gfwContextualLayers.metadata) {
    // TODO
  }
}

function importAlerts(alerts: Array<Alert>) {
  storeAlerts(alerts);
}

function importAreas(areas: Array<Area>, dispatch: Dispatch) {
  areas.forEach(area => {
    dispatch({
      type: SAVE_AREA_COMMIT,
      payload: { ...area, isImported: true }
    });
  });
}

function importBasemaps(basemaps: Array<Layer>, dispatch: Dispatch) {
  basemaps.forEach(basemap => {
    dispatch({
      type: IMPORT_LAYER_REQUEST
    });
    dispatch({
      type: IMPORT_LAYER_COMMIT,
      payload: {
        ...basemap,
        isImported: true
      }
    });
  });
}

function importLayers(layers: Array<Layer>, dispatch: Dispatch) {
  layers.forEach(layer => {
    dispatch({
      type: IMPORT_LAYER_REQUEST
    });
    dispatch({
      type: IMPORT_LAYER_COMMIT,
      payload: {
        ...layer,
        isImported: true
      }
    });
  });
}

function importReports(reports: Array<Report>, dispatch: Dispatch) {
  // GFW-699: Remove the uploaded status at the point of importing, so that the new owner can also choose to import
  reports.forEach(report => {
    dispatch({
      type: IMPORT_REPORT,
      payload: { ...report, isImported: true, status: report.status === 'uploaded' ? 'complete' : report.status }
    });
  });
}

function importRoutes(routes: Array<Route>, dispatch: Dispatch) {
  routes.forEach(route => {
    dispatch({
      type: IMPORT_ROUTE,
      payload: { ...route, isImported: true }
    });
  });
}

function importTemplates(templates: Array<Template>, dispatch: Dispatch) {
  templates.forEach(template => {
    dispatch({
      type: IMPORT_TEMPLATE,
      payload: { ...template, isImported: true }
    });
  });
}
