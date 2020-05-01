// @flow

import { initDb } from 'helpers/alert-store/database';
import { type AlertsQuery, queryAlertsSync } from 'helpers/alert-store/queryAlerts';

/**
 * Asynchronously performs the specified query and then deletes the returned alerts
 */
export default function deleteAlerts(query: AlertsQuery): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      deleteAlertsSync(query);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Synchronous method of the above, because Realm works synchronously
 */
export function deleteAlertsSync(query: AlertsQuery) {
  const realm = initDb();
  const alerts = queryAlertsSync(query);

  if (alerts.length > 0) {
    realm.write(() => {
      realm.delete(alerts);
    });
  }
}
