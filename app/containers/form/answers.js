// @flow
import type { State } from 'types/store.types';
import type { Template, Answer, Report } from 'types/reports.types';

import { REPORTS } from 'config/constants';
import flatMap from 'lodash/flatMap';
import i18n from 'locales';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { saveReport, uploadReport, deleteReport, setReportAnswer } from 'redux-modules/reports';
import { setActiveAlerts } from 'redux-modules/alerts';
import { getTemplate, parseQuestion } from 'helpers/forms';
import Answers from 'components/form/answers';

function getAnswerValues(question, answer) {
  if (typeof answer === 'undefined') return undefined;
  const simpleTypeInputs = ['number', 'text', 'point', 'blob'];
  let value = Array.isArray(answer.value) ? answer.value : [answer.value];
  if (!simpleTypeInputs.includes(question.type)) {
    value = question.values.filter(item => value.includes(item.value))
      .map(item => item.label);
  }
  return { ...answer, value };
}

function mapFormToAnsweredQuestions(answers: Array<Answer>, template: Template, deviceLang: ?string) {
  const questions = flatMap(template.questions, (question) => {
    const parsedQuestion = parseQuestion({ template, question }, deviceLang);
    if (parsedQuestion.childQuestion) {
      const parsedChildQuestion = {
        ...parsedQuestion.childQuestion,
        order: parsedQuestion.order
      };
      return [
        parsedQuestion,
        parsedChildQuestion
      ];
    }
    return parsedQuestion;
  })
    .reduce(
      (acc, question) => ({ ...acc, [question.name]: question }),
      {}
    );
  return flatMap(answers, (answer) => {
    const question = questions[answer.questionName];
    const answeredQuestion = {
      question,
      answer: getAnswerValues(question, answer)
    };

    const hasChild = answer.child && answer.child !== null;
    const childMatchCondition = hasChild && question.childQuestion
      && answer.value === question.childQuestion.conditionalValue;
    if (childMatchCondition) {
      const childQuestion = questions[answer.child.questionName];
      return [
        answeredQuestion,
        {
          question: childQuestion,
          answer: getAnswerValues(childQuestion, answer.child)
        }
      ];
    }

    return answeredQuestion;
  });
}

function mapReportToMetadata(report: Report, language) {
  if (!report) return [];

  const { area: { dataset = {} } } = report;
  const reportedPosition = report.clickedPosition && JSON.parse(report.clickedPosition)
    .map(pos => [
      pos.lat.toLocaleString(undefined, { maximumFractionDigits: 4 }),
      pos.lon.toLocaleString(undefined, { maximumFractionDigits: 4 })
    ].toString());
  const date = moment(report.date).format('YYYY-MM-DD');
  const userPosition = report.userPosition === REPORTS.noGpsPosition
    ? i18n.t('report.noGpsPosition')
    : report.userPosition;
  const metadata = [
    { id: 'name', label: i18n.t('commonText.name'), value: [report.reportName] },
    { id: 'areaName', label: i18n.t('commonText.area'), value: [report.area.name] },
    { id: 'date', label: i18n.t('commonText.date'), value: [date] },
    { id: 'language', label: i18n.t('commonText.language'), value: [language] },
    { id: 'userPosition', label: i18n.t('commonText.userPosition'), value: [userPosition] },
    { id: 'clickedPosition', label: i18n.t('commonText.reportedPosition'), value: [reportedPosition] }
  ];

  if (dataset.slug) {
    metadata.push({ id: 'dataset', label: i18n.t('commonText.alert'), value: [i18n.t(`datasets.${dataset.slug}`)] });
  }

  return metadata;
}

function mapStateToProps(state: State, ownProps: { reportName: string, readOnly: boolean }) {
  const { reportName, readOnly } = ownProps;
  const { reports, app } = state;
  const template = getTemplate(reports, reportName);
  const templateLang = template.languages.includes(app.language) ? app.language : template.defaultLanguage;
  const report = reports.list[reportName];
  const answers = report && report.answers;
  // map readOnly to object because withDraft expects disableDraft and answers expects readOnly
  const readOnlyProps = readOnly ? { disableDraft: true, readOnly } : {};
  return {
    results: mapFormToAnsweredQuestions(answers, template, state.app.language),
    metadata: mapReportToMetadata(report, templateLang),
    ...readOnlyProps
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  saveReport,
  deleteReport,
  uploadReport,
  setReportAnswer,
  setActiveAlerts
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(Answers);
