// @flow

import { initDb } from 'helpers/alert-store/database';
import CONSTANTS from 'config/constants';
import { deleteAlertsSync } from 'helpers/alert-store/deleteAlerts';
const d3Dsv = require('d3-dsv');

/**
 * Asynchronously parse the CSV blob and store it into the database
 *
 * This is intended to parse CSV in the format returned by the fw-alerts endpoint
 */
export default function storeAlertsFromCsv(areaId: string, slug: string, alerts: string, range: number): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      storeAlertsFromCsvSync(areaId, slug, alerts, range);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Synchronous method of the above, because Realm works synchronously
 */
export function storeAlertsFromCsvSync(areaId: string, slug: string, alerts: string, range: number) {
  if (alerts && alerts.length > 0) {
    const realm = initDb();
    if (range) {
      const daysFromRange =
        CONSTANTS.areas.alertRange[slug] - range > 0 ? CONSTANTS.areas.alertRange[slug] - range : range; // just in case we are more outdated than a year
      try {
        deleteAlertsSync({
          areaId: areaId,
          dataset: slug,
          daysAgoMin: daysFromRange
        });
      } catch (e) {
        console.warn('Error cleaning db', e);
      }
    }
    const alertsArray = d3Dsv.csvParse(alerts);
    realm.write(() => {
      alertsArray.forEach(alert => {
        realm.create('Alert', {
          slug,
          areaId,
          date: parseInt(alert.date, 10),
          lat: parseFloat(alert.lat),
          long: parseFloat(alert.lon)
        });
      });
    });
  }
}
