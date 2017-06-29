import { connect } from 'react-redux';
import { saveReport, uploadReport } from 'redux-modules/reports';
import { setCanDisplayAlerts } from 'redux-modules/alerts';
import { getFormFields, getAnswers } from 'helpers/forms';

import ReportForm from 'components/common/form';

function mapStateToProps(state) {
  return {
    form: state.form,
    reports: state.reports
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveReport: (reportName, params) => {
      dispatch(saveReport(reportName, params));
    },
    submitForm: (form, formName, answers) => {
      const fields = getFormFields(form, answers);
      dispatch(uploadReport(formName, fields));
      dispatch(setCanDisplayAlerts(true));
    }
  };
}

function mergeProps({ form, reports, ...state }, { submitForm, ...dispatch }, ownProps) {
  return {
    ...ownProps,
    ...state,
    ...dispatch,
    finish: (formName) => {
      const answers = getAnswers(form, formName);
      submitForm(reports.forms, formName, answers);
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ReportForm);
