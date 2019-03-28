import { mapFormToAnsweredQuestions, mapFormToQuestions } from './forms';

import _ from 'lodash';
const { parse } = require('json2csv');
import RNFetchBlob from 'react-native-fetch-blob';

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
export default async function exportReports(
  reports,
  templates,
  lang,
  dir = RNFetchBlob.fs.dirs.DocumentDir,
  method = ExportMethod.CSV
) {
  return Promise.resolve([`${dir}/export.csv`]);
}

/**
 * Serialises the specifies reports as a collection of CSV-formatted strings.
 *
 * Because it is not possible to put reports following different templates (and hence questions) into the same CSV, we
 * instead group them by template and generate each CSV based on this grouping.
 *
 * See exportReportGroupAsCsv for details of how each group is rendered as a CSV.
 *
 * @param {Report} reports[]
 *  Array of reports to export
 * @param {object} templates
 *  Questionnaire templates mapped by their ID. Reports based on templates not in this object will be ignored.
 * @param {string} lang
 *  Language to use in exported documents. If the language cannot be found in the template then the templates default
 *  language is used.
 * @return {object}
 *  An object where each key is a template ID, and its associated value is a string representing a CSV document of reports
 *  for that template
 */
export function renderReportsAsCsv(reports, templates, lang) {
  const reportsByTemplateId = {};

  // Group all reports by their templateId
  reports?.forEach(report => {
    const templateId = report?.area?.templateId;
    if (templates[templateId]) {
      reportsByTemplateId[templateId] = [...reportsByTemplateId[templateId], report];
    }
  });

  // For each related group of reports, create a CSV
  return _.mapValues(reportsByTemplateId, (reports, template) => renderReportGroupAsCsv(reports, template, lang));
}

/**
 * Serialises the specifies reports as a CSV-formatted string.
 *
 * This function assumes all the reports are "grouped" and follow the structure provided by a given template. This means
 * they can all be put into the same CSV document as they will use the same columns.
 *
 * We try and approximate an implementation which is used by GFW web, although there is no need for an exact copy:
 * https://github.com/gfw-api/gfw-forms-api/blob/develop/app/src/routes/api/v1/questionnaireRouter.js
 *
 * Unfortunately we can't call the implementation above directly (by hitting the API) because we need to be able to generate
 * the CSV offline.
 *
 * @param {Report} reports[]
 *  Array of reports to export, all following the specified template
 * @param {Template} templates
 *  The structure the provided reports are all following
 * @param {string} lang
 *  Language to use in exported documents. If the language cannot be found in the template then the templates default
 *  language is used.
 * @return {string}
 */
export function renderReportGroupAsCsv(reports, template, lang) {
  const questions = mapFormToQuestions(template, lang);

  // These are passed as config to json2csv.
  // Each label represents the column header, and value is a function to calculate the value of each cell
  const questionFields = Object.values(questions).map(question => ({
    label: question.label,
    value: (answers, field) => {
      const answerToThisQuestion = answers.find(answer => question.name === answer.questionName);

      if (!answerToThisQuestion) {
        return null;
      }

      return renderReportAnswerAsText(question.type, answerToThisQuestion.value);
    }
  }));

  // Create an array of arrays. Each inner array is a localised array of answers comprising a report
  const localisedAnswers = reports
    ?.filter(report => !!report)
    ?.map(report => mapFormToAnsweredQuestions(report.answers, template, lang))
    ?.map(mappedReport => mappedReport.map(item => item.answer));

  // Unfortunately the array above still include nested "child" answers. We will flatten these here so everything is in
  // one array
  const flattenedAnswers = localisedAnswers.map(answers =>
    _.flatMap(answers, answer => (answer.child ? [answer, answer.child] : [answer]))
  );

  // Finally send the array (of arrays) into json2csv, where each row will be turned into a line of a CSV file
  return parse(flattenedAnswers, {
    fields: [...questionFields],
    header: true
  });
}

/**
 * Helper function to convert a user-supplied answer to a report question to an appropriate string value
 *
 * @param questionType
 *  The type of the question. One of a fixed number of defined strings, handled
 * @param [*] answerValue[]
 *  Array of submitted answers
 * @return {string}
 *  Possibly null
 */
function renderReportAnswerAsText(questionType, answerValue) {
  switch (questionType) {
    case 'date':
    case 'number':
    case 'point':
    case 'radio':
    case 'select':
    case 'text': {
      return (answerValue || []).join(', ');
    }
    case 'blob':
    default: {
      // TODO: Local file path here?
      return null;
    }
  }
}
