// @flow

import { initDb } from 'helpers/alert-store/database';
import { type AlertsQuery, queryAlertsLazy } from 'helpers/alert-store/queryAlerts';

/**
 * Synchronously performs the specified query and then deletes the returned alerts
 *
 * If you are tempted to turn this into an asynchronous method, don't bother - all Realm calls are blocking :/
 * [1] https://github.com/realm/realm-js/issues/1518
 */
export default function deleteAlerts(query?: AlertsQuery = Object.freeze({})) {
  const realm = initDb();

  if (!query || Object.keys(query).length === 0) {
    realm.deleteAll();
    return;
  }

  const alerts = queryAlertsLazy(query);
  realm.write(() => {
    realm.delete(alerts);
  });
}
