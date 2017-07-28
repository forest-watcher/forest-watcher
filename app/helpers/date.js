import moment from 'moment';
import CONSTANTS from 'config/constants';

// Receives a date in format: YYYYMMDD and returns the number of days since the start date
export function daysToDate(date, start = CONSTANTS.startDate) {
  const startDate = moment(start);
  const parsedDate = moment(date, 'YYYYMMDD');
  return String(parsedDate.diff(startDate, 'days'));
}

export function todayDate() {
  return moment().format('YYYYMMDD');
}

export function isOutdated(date) {
  const now = moment();
  const lastSync = moment(date);
  return lastSync.diff(now, 'days') > 0;
}

