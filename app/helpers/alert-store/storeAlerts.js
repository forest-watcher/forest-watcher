// @flow

import type { Alert } from 'types/alerts.types';
import { initDb } from 'helpers/alert-store/database';

/**
 * Asynchronously store the specified alerts
 */
export default function storeAlerts(alerts: Array<Alert>): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      storeAlertsSync(alerts);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Synchronous method of the above, because Realm works synchronously
 */
export function storeAlertsSync(alerts: Array<Alert>) {
  const realm = initDb();
  realm.write(() => {
    alerts.forEach(alert => {
      realm.create('Alert', alert);
    });
  });
}
