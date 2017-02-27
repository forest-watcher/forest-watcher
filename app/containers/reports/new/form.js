import { connect } from 'react-redux';
import { finishReport, getQuestions } from 'redux-modules/reports';

import ReportsForm from 'components/reports/new/form';

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

function mapStateToProps(state, { form }) {
  return {
    form,
    questions: (state.reports.forms && state.reports.forms.questions) || [],
    answers: getAnswers(state.form, form),
    reportLanguage: getReportLang(state.reports.forms)
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
