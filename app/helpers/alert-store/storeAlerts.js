// @flow

import type { Alert } from 'types/alerts.types';
import { initDb } from 'helpers/alert-store/database';

/**
 * Synchronously store the specified alerts
 *
 * If you are tempted to turn this into an asynchronous method, don't bother - all Realm calls are blocking :/
 * [1] https://github.com/realm/realm-js/issues/1518
 */
export default function storeAlerts(alerts: Array<Alert>): void {
  const realm = initDb();
  realm.write(() => {
    alerts.forEach(alert => {
      realm.create('Alert', alert);
    });
  });
}
