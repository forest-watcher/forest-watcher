// @flow
import type { Answer, Metadata, Question, Report, Template } from 'types/reports.types';
import { mapFormToAnsweredQuestions, mapFormToQuestions, mapReportToMetadata } from './forms';

import _ from 'lodash';

const { parse } = require('json2csv');
import { PermissionsAndroid, Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import i18n from 'i18next';

const moment = require('moment');

export const ExportMethod = {
  CSV: 0,
  HTML: 1,
  PDF: 2
};

/**
 * Exports the specified reports to a specified directory so that the user can access them independently
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
 * @return {string[]}
 *  Array of file paths that were created in order to fulfil the export
 */
export default async function exportReports(
  reports: Array<Report>,
  templates: { [string]: Template },
  lang: string,
  dir: string = RNFetchBlob.fs.dirs.DocumentDir,
  method: number = ExportMethod.CSV
) {
  // TODO: Handle non-CSV methods.
  if (method !== ExportMethod.CSV) {
    throw new Error('Only CSV exporting is handled right now!');
  }

  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
  }

  // Get all of the CSV strings. This'll be a dictionary, with the key being the template ID and the contents being the document string.
  const csvStrings = renderReportsAsCsv(reports, templates, lang);

  // Determine the output directory.
  const formattedDateTime = moment().format('YYYY-MM-DD_HH-mm-ss');
  const exportDirectory = `${dir}/Reports/${formattedDateTime}`;

  // For every CSV string (one per template), get the template's name & save the CSV string to a file!
  const exportedFilePaths: Array<string> = Object.keys(csvStrings).map((key: string) => {
    const csvString = csvStrings[key];
    const templateName: string = templates?.[key]?.['name']?.[lang] || templates?.[key]?.defaultLanguage;

    const completeFilePath = `${exportDirectory}/${templateName}.csv`;
    RNFetchBlob.fs.writeFile(completeFilePath, csvString, 'utf8');
    return completeFilePath;
  });

  return exportedFilePaths;
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
export function renderReportsAsCsv(
  reports: Array<Report>,
  templates: { [string]: Template },
  lang: string
): { [string]: string } {
  const reportsByTemplateId = {};

  // Group all reports by their templateId
  // $FlowFixMe
  reports?.forEach(report => {
    const templateId = report?.area?.templateId;
    if (templates[templateId]) {
      reportsByTemplateId[templateId] = [...(reportsByTemplateId[templateId] || []), report];
    }
  });

  // For each related group of reports, create a CSV
  return _.mapValues(reportsByTemplateId, (reports: Array<Report>, templateId: string) =>
    renderReportGroupAsCsv(reports, templates[templateId], lang)
  );
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
export function renderReportGroupAsCsv(
  reports: Array<Report>,
  template: Template,
  lang: string,
  outputMetadata: boolean = true
) {
  // Define columns based on the metadata returned by mapReportToMetadata. These are passed as config to json2csv.
  // Each label represents the column header, and value is a function to calculate the value of each cell
  const metadataFields = [
    { id: 'name', label: i18n.t('commonText.name') },
    { id: 'areaName', label: i18n.t('commonText.area') },
    { id: 'date', label: i18n.t('commonText.date') },
    { id: 'language', label: i18n.t('commonText.language') },
    { id: 'userPosition', label: i18n.t('commonText.userPosition') },
    { id: 'clickedPosition', label: i18n.t('commonText.reportedPosition') },
    { id: 'dataset', label: i18n.t('commonText.alert') }
  ].map(field => ({
    label: field.label,
    value: (
      reportData: { metadata: ?Array<Metadata> } // $FlowFixMe
    ) => reportData.metadata?.find(item => item.id === field.id)?.value?.join?.(', ')
  }));

  const questions: { [string]: Question } = mapFormToQuestions(template, lang);

  // These are passed as config to json2csv.
  // Each label represents the column header, and value is a function to calculate the value of each cell
  const questionFields = Object.keys(questions)
    .map((key: string) => questions[key])
    .map((question: Question) => ({
      label: question.label,
      value: reportData => {
        const answers: Array<Answer> = reportData.answers;
        const answerToThisQuestion = answers.find(answer => question.name === answer.questionName);

        if (!answerToThisQuestion) {
          return null;
        }

        return renderReportAnswerAsText(question.type, answerToThisQuestion.value);
      }
    }));

  // Create the metadata for each report
  // $FlowFixMe
  const reportMetadata = reports?.filter(report => !!report)?.map(report => mapReportToMetadata(report, lang));
  // Create an array of answer arrays. Each inner array is a localised array of answers comprising a report
  // $FlowFixMe
  const localisedAnswers = reports
    ?.filter(report => !!report)
    ?.map(report => mapFormToAnsweredQuestions(report.answers, template, lang))
    ?.map(mappedReport => mappedReport.map(item => item.answer));

  // Unfortunately the array above still include nested "child" answers. We will flatten these here so everything is in
  // one array
  const flattenedAnswers = localisedAnswers.map(answers =>
    _.flatMap((answers: Array<Answer>), (answer: Answer) => (answer.child ? [answer, answer.child] : [answer]))
  );

  // Now zip together the report metadata and the associated answers
  // This will create an array of arrays, which we then map into a more convenient object format
  const reportData = _.zip(reportMetadata, flattenedAnswers).map(zippedPair => ({
    metadata: zippedPair[0],
    answers: zippedPair[1]
  }));

  // Finally send the array (of arrays) into json2csv, where each row will be turned into a line of a CSV file
  return parse(reportData, {
    fields: [...(outputMetadata ? metadataFields : []), ...questionFields],
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
function renderReportAnswerAsText(questionType: string, answerValue: string | Array<string>): ?string {
  switch (questionType) {
    case 'date':
    case 'number':
    case 'point':
    case 'radio':
    case 'select':
    case 'text': {
      if (Array.isArray(answerValue)) {
        return (answerValue || []).join(', ');
      }
      return '' + (answerValue || '');
    }
    case 'blob':
    default: {
      // TODO: Local file path here?
      return null;
    }
  }
}
