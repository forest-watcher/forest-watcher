import { connect } from 'react-redux';
import { saveReport } from 'redux-modules/reports';
import { getForm, getAnswers, parseQuestion, getFormFields } from 'helpers/forms';
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

function mapFormToAnsweredQuestions(fields, answers, form, deviceLang) {
  const questions = form.questions.filter(question => fields.includes(question.name))
    .map((question, index) => {
      const parsedQuestion = parseQuestion({ form, question }, deviceLang);
      const answer = answers[question.name];
      return {
        question: { ...parsedQuestion, questionNumber: index },
        answers: getAnswerValues(parsedQuestion, answer)
      };
    });
  return questions;
}

function mapStateToProps(state, { form }) {
  const template = getForm(state, form);
  const answers = getAnswers(state.form, form);
  return {
    results: mapFormToAnsweredQuestions(
      getFormFields(template, answers),
      getAnswers(state.form, form),
      template,
      state.app.language
    )
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
