// @flow

import type { ExportBundleRequest } from 'types/sharing.types';
import type { Dispatch, GetState, Thunk } from 'types/store.types';
import exportBundle from 'helpers/sharing/exportBundle';

/**
 * Creates a thunk which when dispatched will create an export bundle using current Redux state.
 */
export default function exportBundleFromRedux(request: $Shape<ExportBundleRequest>): Thunk<Promise<string>> {
  return async (dispatch: Dispatch, getState: GetState): Promise<string> => {
    const state = getState();
    return await exportBundle(state, {
      areaIds: [],
      basemapIds: [],
      layerIds: [],
      reportIds: [],
      routeIds: [],
      ...request
    });
  };
}

/**
 * Creates a thunk which when dispatched will create an export bundle containing as much as possible from the app
 */
export function exportWholeAppBundleFromRedux(): Thunk<Promise<string>> {
  return async (dispatch: Dispatch, getState: GetState): Promise<string> => {
    const state = getState();
    return await exportBundle(state, {
      areaIds: state.areas.data.map(area => area.id),
      basemapIds: Object.keys(state.basemaps.downloadedBasemapProgress ?? {}),
      layerIds: state.layers.imported.map(layer => layer.id),
      reportIds: Object.keys(state.reports.list)
        .map(reportName => state.reports.list[reportName])
        .map(report => report.reportName),
      routeIds: state.routes.previousRoutes.map(route => route.id)
    });
  };
}
