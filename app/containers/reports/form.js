import { connect } from 'react-redux';
import { saveReport, uploadReport } from 'redux-modules/reports';
import { setCanDisplayAlerts } from 'redux-modules/alerts';
import { getFormFields } from 'helpers/forms';

import ReportForm from 'components/reports/form';

function mapStateToProps(state) {
  return {
    form: state.form
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveReport: (reportName, params) => {
      dispatch(saveReport(reportName, params));
    },
    submitForm: (form, formName) => {
      const fields = getFormFields(form, formName);
      dispatch(uploadReport(formName, fields));
      dispatch(setCanDisplayAlerts(true));
    }
  };
}

function mergeProps({ form, ...state }, { submitForm, ...dispatch }, ownProps) {
  return {
    ...ownProps,
    ...state,
    ...dispatch,
    finish: formName => submitForm(form, formName)
  };
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ReportForm);
