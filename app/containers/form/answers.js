// @flow
import type { State } from 'types/store.types';
import type { Template, Answer } from 'types/reports.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { saveReport, uploadReport } from 'redux-modules/reports';
import { setActiveAlerts } from 'redux-modules/alerts';
import { getTemplate, parseQuestion } from 'helpers/forms';
import Answers from 'components/form/answers';

function getAnswerValues(question, answer) {
  const simpleTypeInputs = ['number', 'text', 'point', 'blob'];
  const answerList = Array.isArray(answer) ? answer : [answer];
  if (!simpleTypeInputs.includes(question.type)) {
    return question.values.filter(item => answerList.includes(item.value))
      .map(item => item.label);
  }
  return answerList;
}

function mapFormToAnsweredQuestions(answers: Array<Answer>, template: Template, deviceLang: ?string) {
  const questions = template.questions.reduce(
    (acc, question, index) => ({ ...acc, [question.name]: { ...question, questionNumber: index } }),
    {}
  );
  return answers
  .map((answer) => {
    const question = questions[answer.questionName];
    const parsedQuestion = parseQuestion({ template, question }, deviceLang);
    const value = answer && answer.value;
    return {
      question: { ...parsedQuestion },
      answers: value && getAnswerValues(parsedQuestion, value)
    };
  });
}

function mapStateToProps(state: State, ownProps: { reportName: string, readOnly: boolean }) {
  const { reportName, readOnly } = ownProps;
  const template = getTemplate(state.reports, reportName);
  const answers = state.reports.list[reportName].answers;
  // map readOnly to object because withDraft expects disableDraft and answers expects readOnly
  const readOnlyProps = readOnly ? { disableDraft: true, readOnly } : {};
  return {
    results: mapFormToAnsweredQuestions(
      answers,
      template,
      state.app.language
    ),
    ...readOnlyProps
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  saveReport,
  uploadReport,
  setActiveAlerts
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(Answers);
