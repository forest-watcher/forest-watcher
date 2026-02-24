// @flow
import moment from 'moment';
import i18n from 'i18next';
import _ from 'lodash';

const RECENT_DAYS = 7;

// By default we assume the alerts will be outdate after 1 day
export function isOutdated(date: number, days: number = 1) {
  const now = moment();
  const lastSync = moment(date);
  return now.diff(lastSync, 'days') >= days;
}

function formatSingleInfoBannerDate(date: number, type: string): string {
  const recentAlert = date > moment().subtract(RECENT_DAYS, 'days');
  const dateFormatted = recentAlert ? moment(date).fromNow() : moment(date).format('D MMMM');
  const localisationKey = type === 'alert' ? 'map.issuedDate' : 'map.createdDate';
  return i18n.t(localisationKey, { date: dateFormatted });
}

// show "n days ago" for alerts less than 1 week old. Show "23 Mar" for all other alerts.
export function formatInfoBannerDates(dates: Array<number>, types: Array<string>): string {
  const uniqueDates = _.uniq(dates);
  if (uniqueDates.length === 1) {
    const date = uniqueDates[0];
    const type = types[0];
    return formatSingleInfoBannerDate(date, type);
  }
  const sortedUniqueDates = _.sortBy(uniqueDates);
  const minDate = moment(sortedUniqueDates[0]);
  const maxDate = moment(sortedUniqueDates[sortedUniqueDates.length - 1]);
  const recentDate = moment().subtract(RECENT_DAYS, 'days');
  const bothRecent = minDate > recentDate && maxDate > recentDate;
  // Currently this function is only called with multiple dates if all feature types are `alert`
  // so we can just rely on types[0] here. Will need more thought in the future as to
  // how we handle dates with multiple different feature types selected!
  const localisationKey = types[0] === 'alert' ? 'map.issuedDate' : 'map.createdDate';
  let dateFormatted = '';
  if (bothRecent) {
    const minDays = moment().diff(maxDate, 'days');
    const maxDays = moment().diff(minDate, 'days');
    dateFormatted = i18n.t('map.dateRangeShort', {
      maxDays,
      minDays
    });
  } else {
    const dateFormat = minDate.year() !== maxDate.year() ? 'D MMMM YYYY' : 'D MMMM';
    dateFormatted = i18n.t('map.dateRangeLong', {
      minDate: minDate.format(dateFormat),
      maxDate: maxDate.format(dateFormat)
    });
  }
  return i18n.t(localisationKey, { date: dateFormatted });
}

/**
 * Show explicit date from a Valid date parameter or a Milisecond type
 * @param date | string
 * @returns '2022-12-03' | undefined
 */
export function getExplicitDate(date: Date | string): string {
  const parsedDate = moment(date);
  const validDateFormat = parsedDate.isValid();
  // Date param
  if (validDateFormat) return parsedDate.format('YYYY-MM-DD');
  // Milliseconds param
  return moment(Number(date)).format('YYYY-MM-DD');
}
