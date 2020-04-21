// @flow
import type { State } from 'types/store.types';

import { put, takeEvery, select, all, fork } from 'redux-saga/effects';
import { getAreaAlerts } from 'redux-modules/alerts';
import { GET_AREAS_COMMIT, SAVE_AREA_COMMIT } from 'redux-modules/areas';
import { AREAS as areasConstants } from 'config/constants';
import moment from 'moment/moment';

function* syncAlertDatasets({ area, alertsData }): Generator<*, *, *> {
  yield all(
    Object.entries(areasConstants.alertRange)
      // $FlowFixMe
      .map((entry: [string, number]) => {
        const [dataset, defaultRange] = entry;
        let range = defaultRange;
        // Get the last cache date and request only that new data
        const lastUpdated = alertsData?.[area.id]?.[dataset]?.lastUpdated;
        if (lastUpdated) {
          const now = moment();
          const lastCache = moment(lastUpdated);
          const daysFromLastCache = now.diff(lastCache, 'days');
          if (daysFromLastCache >= 0) {
            range = (daysFromLastCache: number);
          }
        }
        return put(getAreaAlerts(area, dataset, range));
      })
  );
}

export function* getAlertsOnAreasCommit(): Generator<*, *, *> {
  function* syncAlertsSaga(): Generator<*, *, *> {
    const areas = yield select((state: State) => state.areas.data);
    const data = yield select((state: State) => state.alerts.data);

    yield all(areas.map(area => fork(syncAlertDatasets, { area, data })));
  }

  yield takeEvery(GET_AREAS_COMMIT, syncAlertsSaga);
}

export function* getAlertsOnAreaCreation(): Generator<*, *, *> {
  function* readSaveAreaPayload(action): Generator<*, *, *> {
    const data = yield select((state: State) => state.alerts.data);
    yield fork(syncAlertDatasets, { area: action.payload, data });
  }

  yield takeEvery(SAVE_AREA_COMMIT, readSaveAreaPayload);
}
