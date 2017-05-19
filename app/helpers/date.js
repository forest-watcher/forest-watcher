import moment from 'moment';
import CONSTANTS from 'config/constants';

// Receives a date in format: yyyyMMdd and returns the number of days since the start date
export default function daysSince(date, start = CONSTANTS.startDate) {
  const startDate = moment(start);
  const parsedDate = moment(date);
  return String(parsedDate.diff(startDate, 'days'));
}
