// @flow

import type { Alert } from 'types/alerts.types';
import type { Area } from 'types/areas.types';
import type { SharingBundle } from 'types/sharing.types';
import type { Dispatch } from 'types/store.types';
import type { Route } from 'types/routes.types';
import type { Report } from 'types/reports.types';
import type { ContextualLayer } from 'types/layers.types';
import type { Basemap } from 'types/basemaps.types';
import { storeAlertsSync } from 'helpers/alert-store/storeAlerts';
import { IMPORT_AREA } from 'redux-modules/areas';

export default function importAppData(bundle: SharingBundle, dispatch: Dispatch) {
  importAlerts(bundle.alerts);
  importAreas(bundle.areas, dispatch);
  importBasemaps(bundle.basemaps, dispatch);
  importLayers(bundle.layers, dispatch);
  importReports(bundle.reports, dispatch);
  importRoutes(bundle.routes, dispatch);
}

function importAlerts(alerts: Array<Alert>) {
  console.log("3SC", "Importing alerts", alerts.length);
  storeAlertsSync(alerts);
}

function importAreas(areas: Array<Area>, dispatch: Dispatch) {
  console.log("3SC", "Importing areas", areas.length);
  areas.forEach(area => {
    dispatch({
      type: IMPORT_AREA,
      payload: area
    });
  });
}

function importBasemaps(areas: Array<Basemap>, dispatch: Dispatch) {
  // TODO
}

function importLayers(areas: Array<ContextualLayer>, dispatch: Dispatch) {
  // TODO
}

function importReports(areas: Array<Report>, dispatch: Dispatch) {
  // TODO
}

function importRoutes(routes: Array<Route>, dispatch: Dispatch) {
  // TODO
}
