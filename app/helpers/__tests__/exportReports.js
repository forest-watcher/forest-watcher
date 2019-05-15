import moment from 'moment';

import { renderReportGroupAsCsv } from '../exportReports';
import {
  createFakeLanguages,
  createFakeQuestion,
  createFakeReport,
  createFakeTemplate
} from '../__mocks__/generateFakeData';

const faker = require('faker');

describe('report export', () => {
  it('renderReportGroupAsCsv outputs correct metafield headers', () => {
    const languages = createFakeLanguages(3);
    const template = createFakeTemplate({ languages: languages, questions: [] });
    const deviceLang = faker.random.arrayElement(languages);
    const csv = renderReportGroupAsCsv([], template, deviceLang);
    expect(csv).toEqual(
      ['Name', 'Area', 'Date', 'Language', 'User Position', 'Reported Position', 'Alert']
        .map(text => `"${text}"`)
        .join(',')
    );
  });

  it('renderReportGroupAsCsv outputs correct metafield values', () => {
    const languages = createFakeLanguages(3);
    const template = createFakeTemplate({ languages: languages, questions: [] });
    const deviceLang = faker.random.arrayElement(languages);
    const report = createFakeReport(template, deviceLang, {
      clickedPosition: `[
      {
        "lat": 1.111111,
        "lon": 2.222222
      }
    ]`
    });
    const expectedMetaValues = [
      report.reportName,
      report.area.name,
      moment(report.date).format('YYYY-MM-DD'),
      deviceLang,
      report.userPosition,
      '1.1111,2.2222', // truncated to 4 decimal places
      ''
    ];

    const csv = renderReportGroupAsCsv([report], template, deviceLang);
    const csvLine2 = csv.split('\n')[1];

    expect(csvLine2).toEqual(expectedMetaValues.map(text => (text?.length > 0 ? `"${text}"` : '')).join(','));
  });

  it('renderReportGroupAsCsv works with text then radio question', () => {
    const languages = createFakeLanguages(3);
    const question1 = createFakeQuestion(languages, {
      type: 'text',
      childQuestions: []
    });
    const question2 = createFakeQuestion(languages, {
      type: 'radio',
      childQuestions: []
    });

    const template = createFakeTemplate({ languages: languages, questions: [question1, question2] });
    const deviceLang = faker.random.arrayElement(languages);
    const report = createFakeReport(template, deviceLang);

    const csv = renderReportGroupAsCsv([report], template, deviceLang, false);

    expect(csv).toEqual(
      `"${question1.label[deviceLang]}","${question2.label[deviceLang]}"\n"${report.answers[0].value}","${
        question2.values[deviceLang].find(item => item.value === report.answers[1].value[0]).label
      }"`
    );
  });

  it('renderReportGroupAsCsv works with multiple reports', () => {
    const languages = createFakeLanguages(3);
    const question1 = createFakeQuestion(languages, {
      type: 'text',
      childQuestions: []
    });

    const template = createFakeTemplate({ languages: languages, questions: [question1] });
    const deviceLang = faker.random.arrayElement(languages);
    const report1 = createFakeReport(template, deviceLang);
    const report2 = createFakeReport(template, deviceLang);

    const csv = renderReportGroupAsCsv([report1, report2], template, deviceLang, false);

    expect(csv).toEqual(
      `"${question1.label[deviceLang]}"\n"${report1.answers[0].value}"\n"${report2.answers[0].value}"`
    );
  });
});
