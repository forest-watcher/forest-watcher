// @flow
import type { State } from 'types/store.types';
import type { AlertDatasetConfig } from 'types/alerts.types';

import { put, takeEvery, select, all, fork } from 'redux-saga/effects';
import { getAreaAlerts, clearAreaAlertsCache } from 'redux-modules/alerts';
import { GET_AREAS_COMMIT, SAVE_AREA_COMMIT } from 'redux-modules/areas';
import { DATASETS } from 'config/constants';
import moment from 'moment/moment';
import deleteAlerts from 'helpers/alert-store/deleteAlerts';
import { decreaseAppSynced } from '../redux-modules/app';

function* syncAlertDatasets({ area, cache }): Generator<*, *, *> {
  yield all(
    Object.values(DATASETS)
      // $FlowFixMe
      .map((datasetConfig: AlertDatasetConfig) => {
        const slug = datasetConfig.id;
        let range = datasetConfig.requestThreshold;
        // Get the last cache date and request only that new data
        const now = moment();
        if (cache[slug] && cache[slug][area.id]) {
          const lastCache = moment(cache[slug][area.id]);
          const daysFromLastCache = now.diff(lastCache, 'days');
          if (daysFromLastCache >= 0) {
            range = (daysFromLastCache: number);
          }
        }
        const minDate = now.subtract(range, 'days');
        return put(getAreaAlerts(area, slug, datasetConfig.api, minDate));
      })
  );
}

export function* getAlertsOnAreasCommit(): Generator<*, *, *> {
  let oldAreas = yield select((state: State) => state.areas.data);

  function* syncAlertsSaga(): Generator<*, *, *> {
    const areas = yield select((state: State) => state.areas.data);
    // All areas for which geostore id has changed remotely
    const changedAreas = oldAreas.filter(oldArea => {
      // Find a new matching area from payload for each old area
      const newMatchingArea = areas.find(area => {
        return area.id === oldArea.id;
      });
      return newMatchingArea && newMatchingArea.geostore.id !== oldArea.geostore.id;
    });
    // Doesn't need to be yielded because database writes happen synchronously
    changedAreas.forEach(area => deleteAlerts({ areaId: area.id }));
    if (changedAreas.length > 0) {
      yield all(changedAreas.map(area => put(clearAreaAlertsCache(area))));
    }
    // Have to update this here because `getAlertsOnAreasCommit` is only called once per launch!
    // eslint-disable-next-line require-atomic-updates
    oldAreas = areas;
    // Order important here! It's important we pull `cache` from state
    // AFTER we clear caches above
    const cache = yield select((state: State) => state.alerts.cache);
    yield all(areas.map(area => fork(syncAlertDatasets, { area, cache })));
  }

  yield takeEvery(GET_AREAS_COMMIT, syncAlertsSaga);
}

export function* getAlertsOnAreaCreation(): Generator<*, *, *> {
  function* readSaveAreaPayload(action): Generator<*, *, *> {
    const cache = yield select((state: State) => state.alerts.cache);
    yield fork(syncAlertDatasets, { area: action.payload, cache });
  }

  yield takeEvery(SAVE_AREA_COMMIT, readSaveAreaPayload);
}
