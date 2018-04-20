// @flow
import moment from 'moment';

// By default we assume the alerts will be outdate after 1 day
export function isOutdated(date: number, days: number = 1) {
  const now = moment();
  const lastSync = moment(date);
  return now.diff(lastSync, 'days') >= days;
}

