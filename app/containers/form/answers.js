// @flow
import { connect } from 'react-redux';
import { saveReport } from 'redux-modules/reports';
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

function mapFormToAnsweredQuestions(answers, template, deviceLang) {
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

function mapStateToProps(state, { reportName, readOnly }) {
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

function mapDispatchToProps(dispatch) {
  return {
    saveReport: (reportName, params) => {
      dispatch(saveReport(reportName, params));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Answers);
