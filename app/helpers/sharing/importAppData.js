// @flow

import type { Alert } from 'types/alerts.types';
import type { Area } from 'types/areas.types';
import type { SharingBundle } from 'types/sharing.types';
import type { Dispatch } from 'types/store.types';
import type { Route } from 'types/routes.types';
import type { Report, Template } from 'types/reports.types';
import type { ContextualLayer } from 'types/layers.types';
import type { Basemap } from 'types/basemaps.types';
import storeAlerts from 'helpers/alert-store/storeAlerts';
import { SAVE_AREA_COMMIT } from 'redux-modules/areas';
import { IMPORT_LAYER_REQUEST, IMPORT_LAYER_COMMIT } from 'redux-modules/layers';
import { IMPORT_ROUTE } from 'redux-modules/routes';
import { IMPORT_REPORT, IMPORT_TEMPLATE } from 'redux-modules/reports';

export default function importAppData(bundle: SharingBundle, dispatch: Dispatch) {
  importAlerts(bundle.alerts);
  importAreas(bundle.areas, dispatch);
  importBasemaps(bundle.basemaps, dispatch);
  importLayers(bundle.layers, dispatch);
  importRoutes(bundle.routes, dispatch);

  // Import templates before reports just in case, as the latter is dependent on the former
  importTemplates(Object.keys(bundle.templates).map(key => bundle.templates[key]), dispatch);
  importReports(bundle.reports, dispatch);
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

function importBasemaps(areas: Array<Basemap>, dispatch: Dispatch) {
  // TODO
}

function importLayers(layers: Array<ContextualLayer>, dispatch: Dispatch) {
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
  reports.forEach(report => {
    dispatch({
      type: IMPORT_REPORT,
      payload: { ...report, isImported: true }
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
