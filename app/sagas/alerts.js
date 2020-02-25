// @flow
import type { State } from 'types/store.types';

import { put, takeEvery, select, all, fork } from 'redux-saga/effects';
import { getAreaAlerts } from 'redux-modules/alerts';
import { GET_AREAS_COMMIT, SAVE_AREA_COMMIT } from 'redux-modules/areas';
import { AREAS as areasConstants } from 'config/constants';
import moment from 'moment/moment';

function* syncAlertDatasets({ area, cache }): Generator<*, *, *> {
  yield all(
    Object.entries(areasConstants.alertRange)
      // $FlowFixMe
      .map((entry: [string, number]) => {
        const [slug, defaultRange] = entry;
        let range = defaultRange;
        // Get the last cache date and request only that new data
        if (cache[slug] && cache[slug][area.id]) {
          const now = moment();
          const lastCache = moment(cache[slug][area.id]);
          const daysFromLastCache = now.diff(lastCache, 'days');
          if (daysFromLastCache >= 0) {
            range = (daysFromLastCache: number);
          }
        }
        return put(getAreaAlerts(area, slug, range));
      })
  );
}

export function* getAlertsOnAreasCommit(): Generator<*, *, *> {
  function* syncAlertsSaga(): Generator<*, *, *> {
    const areas = yield select((state: State) => state.areas.data);
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
