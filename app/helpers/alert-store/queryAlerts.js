// @flow
import type { Alert } from 'types/common.types';
import moment from 'moment';
import { initDb } from 'helpers/alert-store/database';

export type AlertsQuery = {|
  +areaId?: string,
  +dataset?: string,
  +daysAgoMin?: number,
  +daysAgoMax?: number,

  /**
   * Flag indicating whether we should remove alerts corresponding to the same location
   *
   * For instance, if we're querying alerts to display on a map then it doesn't make sense to have two alerts in the
   * same geographic coordinate
   */
  +distinctLocations?: boolean
|};

/**
 * Asynchronously performs the specified alerts query
 */
export default function queryAlerts(query: AlertsQuery): Promise<Array<Alert>> {
  return new Promise((resolve, reject) => {
    try {
      const alerts = queryAlertsSync(query);
      resolve(alerts);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Synchronous method of the above, because Realm works synchronously
 */
export function queryAlertsSync(query: AlertsQuery): Array<Alert> {
  const { areaId, dataset, daysAgoMin, daysAgoMax, distinctLocations } = query;
  const db = initDb();

  const predicateParts = [];

  if (areaId) {
    predicateParts.push(`areaId = '${areaId}'`);
  }

  if (dataset) {
    predicateParts.push(`slug = '${dataset}'`);
  }

  if (daysAgoMax !== undefined) {
    const date = moment()
      .subtract(daysAgoMax, 'day')
      .valueOf();
    predicateParts.push(`date > '${date}'`);
  }

  if (daysAgoMin !== undefined) {
    const date = moment()
      .subtract(daysAgoMin, 'day')
      .valueOf();
    predicateParts.push(`date < '${date}'`);
  }

  const predicateString = predicateParts.join(' AND ') || 'TRUEPREDICATE';
  const queryParts = [predicateString, 'SORT(date DESC)'];

  if (distinctLocations) {
    queryParts.push('DISTINCT(slug,lat,long)');
  }

  const queryString = queryParts.join(' ');
  const alertsQuery = db.objects('Alert').filtered(queryString);
  const alerts = Array.from(alertsQuery);
  return alerts;
}
