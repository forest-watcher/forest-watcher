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
