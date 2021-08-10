// @flow

import { DATASETS } from 'config/constants';
import deleteAlerts from 'helpers/alert-store/deleteAlerts';
import storeAlerts from 'helpers/alert-store/storeAlerts';

import moment from 'moment';
const d3Dsv = require('d3-dsv');

/**
 * Synchronously parse the JSON blob and store it into the database
 *
 * This is intended to parse JSON in the format returned by the data API endpoints
 */
export default function storeAlertsFromCSV(
  areaId: string,
  slug: string,
  confidenceKey?: string,
  dateKey: string,
  alerts: string,
  minDate: Date
) {
  if (alerts && alerts.length > 0) {
    if (minDate) {
      const requestThreshold = DATASETS[slug].requestThreshold;
      const range = moment(minDate).diff(moment(), 'days');
      // just in case we are more outdated than the request threshold of the alert type
      const daysFromRange = requestThreshold - range > 0 ? requestThreshold - range : range;
      try {
        deleteAlerts({
          areaId: areaId,
          dataset: slug,
          timeAgo: { min: daysFromRange, unit: 'days' }
        });
      } catch (e) {
        console.warn('Error cleaning db', e);
      }
    }
    const alertsArray = d3Dsv.csvParse(alerts);
    storeAlerts(
      alertsArray.map(alert => ({
        slug,
        areaId,
        confidence: confidenceKey ? alert[confidenceKey] ?? '' : '',
        date: moment(alert[dateKey], 'YYYY-MM-DD').valueOf(),
        lat: parseFloat(alert.latitude),
        long: parseFloat(alert.longitude)
      }))
    );
  }
}
