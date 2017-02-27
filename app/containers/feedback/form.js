import { connect } from 'react-redux';
import { finishFeedback, getQuestions } from 'redux-modules/feedback';

import ReportsForm from 'components/feedback/form';

function getAnswers(forms, formName) {
  if (!forms) return null;
  if (forms[formName] && forms[formName].values) return forms[formName].values;
  return {};
}

function getReportLang(report) {
  if (!report || !report.name) return 'EN';
  const lang = report.name.split('-')[1];
  return lang ? lang.toUpperCase() : 'EN';
}

function mapStateToProps(state, { feedback }) {
  return {
    form: feedback,
    questions: state.feedback[feedback].questions || [],
    answers: getAnswers(state.form, feedback),
    reportLanguage: getReportLang(state.feedback.forms)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    finishFeedback: (type) => {
      dispatch(finishFeedback(type));
    },
    getQuestions: (type) => {
      dispatch(getQuestions(type));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReportsForm);
