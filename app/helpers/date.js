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

