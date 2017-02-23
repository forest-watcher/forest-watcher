import { connect } from 'react-redux';
import { finishReport, getQuestions } from 'redux-modules/reports';

import ReportsForm from 'components/reports/new/form';

function getAnswers(forms, formName) {
  if (!forms) return null;
  if (forms[formName] && forms[formName].values) return forms[formName].values;
  return {};
}

function mapStateToProps(state, { form }) {
  return {
    form,
    questions: state.reports.forms.questions || [],
    answers: getAnswers(state.form, form)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    finishReport: (reportName) => {
      dispatch(finishReport(reportName));
    },
    getQuestions: () => {
      dispatch(getQuestions());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReportsForm);
