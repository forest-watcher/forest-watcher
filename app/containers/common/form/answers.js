import { connect } from 'react-redux';
import { arrayRemove, arrayRemoveAll } from 'redux-form';
import { saveReport } from 'redux-modules/reports';
import { getTemplate, getAnswers, parseQuestion, getFormFields } from 'helpers/forms';
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
  const questions = form.questions.map((question, index) => ({ ...question, questionNumber: index }))
    .filter(question => fields.includes(question.name))
    .map((question) => {
      const parsedQuestion = parseQuestion({ form, question }, deviceLang);
      const answer = answers[question.name];
      if (question.type === 'blob' && typeof answer === 'undefined') {
        console.warn(`Image of question (${question.Id}) was not saved properly`);
      }
      return {
        question: { ...parsedQuestion },
        answers: getAnswerValues(parsedQuestion, answer)
      };
    });
  return questions;
}

function mapStateToProps(state, { form, readOnly }) {
  const template = getTemplate(state.reports, form);
  const answers = getAnswers(state.form, form);
  // map readOnly to object because withDraft expects disableDraft and answers expects readOnly
  const readOnlyProps = readOnly ? { disableDraft: true, readOnly } : {};
  return {
    results: mapFormToAnsweredQuestions(
      getFormFields(template, answers),
      getAnswers(state.form, form),
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
    },
    removeAnswer: (form, name, index) => {
      dispatch(arrayRemove(form, name, index));
    },
    removeAllAnswers: (form, name) => {
      dispatch(arrayRemoveAll(form, name));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Answers);
