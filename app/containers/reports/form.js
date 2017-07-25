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
    submitForm: (template, reportName, answers) => {
      const fields = getFormFields(template, answers);
      dispatch(uploadReport({ reportName, fields }));
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
      const templateId = reports.list[formName].area.templateId || 'default';
      submitForm(reports.templates[templateId], formName, answers);
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ReportForm);
