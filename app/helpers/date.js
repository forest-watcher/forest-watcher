// @flow
import moment from 'moment';
import i18n from "i18next";

// By default we assume the alerts will be outdate after 1 day
export function isOutdated(date: number, days: number = 1) {
  const now = moment();
  const lastSync = moment(date);
  return now.diff(lastSync, 'days') >= days;
}

// show "n days ago" for alerts less than 1 week old. Show "23 Mar" for all other alerts.
export function formatInfoBannerDate(date: number, type: string): string {
  const recentAlert = date > moment().subtract(7, 'days');
  const dateFormatted = recentAlert ? moment(date).fromNow() : moment(date).format('D MMMM');
  const localisationKey = type === 'alert' ? 'map.issuedDate' : 'map.createdDate';
  return i18n.t(localisationKey, { date: dateFormatted });
}
