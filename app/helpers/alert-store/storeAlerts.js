// @flow

import type { Alert } from 'types/alerts.types';

import { Alert as RNAlert } from 'react-native';
import i18n from 'i18next';
import { generateAlertId, initDb } from 'helpers/alert-store/database';

/**
 * Synchronously store the specified alerts
 *
 * If you are tempted to turn this into an asynchronous method, don't bother - all Realm calls are blocking :/
 * [1] https://github.com/realm/realm-js/issues/1518
 */
export default function storeAlerts(alerts: Array<Alert>): void {
  try {
    const alertsWithIds = alerts.map(alert => (alert.id ? alert : { ...alert, id: generateAlertId(alert) }));
    const realm = initDb();

    realm.write(() => {
      alertsWithIds.forEach(alert => {
        realm.create('Alert', alert, 'modified');
      });
    });
  } catch (error) {
    if (error.code === 13) {
      RNAlert.alert(i18n.t('sync.outOfSpace.title'), i18n.t('sync.outOfSpace.message'), [
        {
          title: i18n.t('commonText.ok'),
          style: 'default'
        }
      ]);
    }
  }
}
