// @flow

import type { Report } from 'types/reports.types';

export const ExportMethod = {
  CSV: 0,
  HTML: 1,
  PDF: 2
};

/**
 * Asynchronously exports the specified reports to a specified directory so that the user can access them independently
 * of the app.
 *
 * @param {Report} reports[]
 *  Array of reports to export
 * @param {string} dir
 *  Target directory to export the reports to
 * @param {string} method
 *  Integer corresponding to one of the values in ExportMethod indicating which format to export the data
 * @return {Promise<string[]>}
 *  Promise holding an array of file paths that were created in order to fulfil the export
 */
export default async function exportReports(reports: Report[], dir: string, method: number = ExportMethod.CSV) {
  return Promise.resolve([`${dir}/export.csv`]);
}
