// @flow
import type { Alert } from 'types/alerts.types';
import _ from 'lodash';
import moment from 'moment';
import { initDb } from 'helpers/alert-store/database';
import type { AssignmentLocation } from 'types/assignments.types';

export type AlertsQuery = {|
  +areaId?: string,
  +dataset?: string,
  /**
   If both `datasets` and `dataset` are provided, then `datasets` will take precedence when requ
   */
  +datasets?: Array<string>,
  +timeAgo?: { min?: number, max?: number, unit: string },
  /**
   * GFW-770: We limit the amount of alerts to 10,000 by default (unless deleting alerts).
   * To prevent slowing down old devices with too many alerts in state.
   */
  +limitAlerts?: boolean,

  /**
   * Flag indicating whether we should remove alerts corresponding to the same location
   *
   * For instance, if we're querying alerts to display on a map then it doesn't make sense to have two alerts in the
   * same geographic coordinate
   */
  +distinctLocations?: boolean,

  /**
   * A list of alerts we want to fetch based on their location
   */
  +specificAlerts?: ?Array<AssignmentLocation>
|};

/**
 * Synchronously performs the specified alerts query
 *
 * If you are tempted to turn this into an asynchronous method, don't bother - all Realm calls are blocking :/
 * [1] https://github.com/realm/realm-js/issues/1518
 */
export default function queryAlerts(query: AlertsQuery): Array<Alert> {
  const alertsQuery = queryAlertsLazy(query);
  const alerts = Array.from(alertsQuery, item => _.omit(item, 'id')); // Don't bother loading id into memory
  return alerts;
}

/**
 * Synchronous method of the above, because Realm works synchronously
 */
export function queryAlertsLazy(query: AlertsQuery) {
  const { areaId, dataset, datasets, timeAgo, distinctLocations, limitAlerts, specificAlerts } = query;
  const db = initDb();

  const predicateParts = [];

  if (areaId) {
    predicateParts.push(`areaId = '${areaId}'`);
  }

  if (datasets && datasets.length > 0) {
    const datasetsPredicate = datasets
      .map(dataset => {
        return `slug = '${dataset}'`;
      })
      .join(' OR ');
    predicateParts.push(`(${datasetsPredicate})`);
  } else if (dataset) {
    predicateParts.push(`slug = '${dataset}'`);
  }

  // If we're looking for specific alerts, we ignore `timeAgo` becasue those alerts might be old
  if (specificAlerts) {
    const specificAlertsPredicate = specificAlerts
      .filter(x => x.alertType !== undefined)
      .map(
        x =>
          `((lat > ${x.lat - 0.00001} AND lat < ${x.lat + 0.00001} ) AND (long > ${x.lon - 0.00001} AND long < ${x.lon +
            0.00001} ) ${x.alertId &&
            `AND (date >= ${moment(x.alertId)
              .subtract(1, 'days')
              .valueOf()} AND date < ${moment(x.alertId)
              .add(1, 'days')
              .valueOf()})`})`
      )
      .join(' OR ');
    predicateParts.push(`(${specificAlertsPredicate})`);
  } else if (timeAgo) {
    const units = timeAgo.unit;
    const now = moment();
    if (timeAgo.max !== undefined) {
      const date = now.subtract(timeAgo.max, units).valueOf();
      predicateParts.push(`date > '${date}'`);
    }
    if (timeAgo.min !== undefined) {
      const date = now.subtract(timeAgo.min, units).valueOf();
      predicateParts.push(`date < '${date}'`);
    }
  }

  const predicateString = predicateParts.join(' AND ') || 'TRUEPREDICATE';
  const queryParts = [predicateString, 'SORT(date DESC)'];

  if (distinctLocations) {
    queryParts.push('DISTINCT(slug,lat,long)');
  }

  if (limitAlerts) {
    queryParts.push('LIMIT(5000)');
  }

  const queryString = queryParts.join(' ');
  const data = db.objects('Alert').filtered(queryString);

  return data;
}
