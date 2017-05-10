import { connect } from 'react-redux';
import { finishReport } from 'redux-modules/reports';

import ReportsForm from 'components/reports/new/form-step';

function getAnswers(forms, formName) {
  if (!forms) return null;
  if (forms[formName] && forms[formName].values) return forms[formName].values;
  return {};
}

/* function getReportLang(report) {
  if (!report || !report.name) return 'EN';
  const lang = report.name.split('-')[1];
  return lang ? lang.toUpperCase() : 'EN';
} */

function getBtnTextByType(type) {
  switch (type) {
    case 'text':
      return 'report.inputText';
    case 'radio':
      return 'report.inputRadio';
    case 'select':
      return 'report.inputSelect';
    default:
      return 'report.input';
  }
}

function getBtnTextByPosition(position, total) {
  return position < total ? 'commonText.next' : 'commonText.save';
}

function getNextCallback(currentQuestion, questions, answers, dispatch, navigation) {
  let next = 1;
  if (currentQuestion < questions.length - 1) {
    for (let i = currentQuestion + 1, qLength = questions.length; i < qLength; i++) {
      const nextConditions = questions[i].conditions;
      const nexthasConditions = nextConditions && nextConditions.length > 0;
      if (!nexthasConditions || (answers[nextConditions[0].name] === nextConditions[0].value)) {
        break;
      }
      next += 1;
    }
    return () => navigation.navigate('NewReport', { step: currentQuestion + next });
  }
  const { state } = navigation;
  const form = state && state.params && state.params.form;
  return () => {
    dispatch(finishReport(form));
    navigation.goBack();
  };
}

function mapStateToProps(state, { form, index }) {
  const questions = state.reports.forms && state.reports.forms.questions;
  const question = questions && state.reports.forms.questions[index];
  const answers = getAnswers(state.form, form);
  const answer = answers[question.name] || null;
  const nextText = !answer && question.required ? getBtnTextByType(question.type) : getBtnTextByPosition(index, questions.length - 1);

  return {
    question,
    questions,
    answer,
    answers,
    nextText
  };
}

function mergeProps(stateProps, { dispatch }, { index, form, navigation }) {
  return {
    form,
    navigation,
    question: stateProps.question,
    answer: stateProps.answer,
    next: { text: stateProps.nextText, callback: getNextCallback(index, stateProps.questions, stateProps.answers, dispatch, navigation) }
  };
}

export default connect(
  mapStateToProps,
  null,
  mergeProps
)(ReportsForm);
