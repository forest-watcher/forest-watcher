// @flow

import { initDb, read } from 'helpers/alert-store/database';
import CONSTANTS from 'config/constants';
import moment from 'moment';
const d3Dsv = require('d3-dsv');

export default function storeAlerts(areaId: string, slug: string, alerts: string, range: number) {
  if (alerts && alerts.length > 0) {
    const realm = initDb();
    if (range) {
      const daysFromRange =
        CONSTANTS.areas.alertRange[slug] - range > 0 ? CONSTANTS.areas.alertRange[slug] - range : range; // just in case we are more outdated than a year
      const oldAlertsRange = moment()
        .subtract(daysFromRange, 'days')
        .valueOf();
      const existingAlerts = read(realm, 'Alert').filtered(
        `areaId = '${areaId}' AND slug = '${slug}' AND date < '${oldAlertsRange}'`
      );
      if (existingAlerts.length > 0) {
        try {
          realm.write(() => {
            realm.delete(existingAlerts);
          });
        } catch (e) {
          console.warn('Error cleaning db', e);
        }
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
