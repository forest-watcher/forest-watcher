import moment from 'moment';
// Receives a date in format: yyyyMMdd and returns the number of days since the start date
export default function daysSince(date) {
  const START_DATE = moment('20150101');
  const parsedDate = moment(date);
  return String(parsedDate.diff(START_DATE, 'days'));
}
