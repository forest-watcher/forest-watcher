// @flow

import i18n from 'i18next';

/**
 * Converts a report name, to a readable, localised string
 * @param {string} reportName - The report name to convert
 * @return {string} A localised, readable version of the string
 */
export function readableNameForReportName(reportName: string) {
  // Using a full regex match for the end of the report name here including data so if user names there area something like SAMS-WIGGLY-REPORT
  // it doesn't intefere with our logic. Can't be a global const otherwise we get a weird issue where it fails every n+1 attempts and returns null!
  const reportNameRegex = /-([A-Z]+)-REPORT--\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/g;
  const result = reportNameRegex.exec(reportName);
  if (!result || result.length < 2) {
    return reportName;
  }
  switch (result[1]) {
    case 'VIIRS':
      return i18n.t('report.viirs');
    case 'GLAD':
      return i18n.t('report.glad');
    default:
      return reportName;
  }
}
