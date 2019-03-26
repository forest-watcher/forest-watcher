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
 * @param {object} templates
 *  Questionnaire templates mapped by their ID. Reports based on templates not in this object will be ignored.
 * @param {string} lang
 *  Language to use in exported documents. If the language cannot be found in the template then the templates default
 *  language is used.
 * @param {string} dir
 *  Target directory to export the reports to
 * @param {number} method
 *  Integer corresponding to one of the values in ExportMethod indicating which format to export the data
 * @return {Promise<string[]>}
 *  Promise holding an array of file paths that were created in order to fulfil the export
 */
export default async function exportReports(reports, templates, lang, dir, method = ExportMethod.CSV) {
  return Promise.resolve([`${dir}/export.csv`]);
}
