import { connect } from 'react-redux';
import { saveReport } from 'redux-modules/reports';
import { getForm, getAnswers, parseQuestion } from 'helpers/forms';
import Answers from 'components/common/form/answers';

function getAnswerValues(question, answer) {
  const simpleTypeInputs = ['number', 'text', 'point', 'blob'];
  const answerList = Array.isArray(answer) ? answer : [answer];
  if (!simpleTypeInputs.includes(question.type)) {
    return question.values.filter(item => answerList.includes(item.value))
      .map(item => item.label);
  }
  return answerList;
}

function mapFormToAnsweredQuestions(answers, form, deviceLang) {
  const questions = form.questions.map((question) => {
    const parsedQuestion = parseQuestion({ form, question }, deviceLang);
    const answer = answers[question.name];
    return {
      question: parsedQuestion,
      answers: getAnswerValues(parsedQuestion, answer)
    };
  });
  return questions;
}

function mapStateToProps(state, { form }) {
  return {
    results: mapFormToAnsweredQuestions(getAnswers(state.form, form), getForm(state, form), state.app.language)
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
