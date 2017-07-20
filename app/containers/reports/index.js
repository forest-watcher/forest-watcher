import { connect } from 'react-redux';
import { uploadReport } from 'redux-modules/reports';
import { setCanDisplayAlerts } from 'redux-modules/alerts';
import { getAnswers, getFormFields } from 'helpers/forms';

import Reports from 'components/reports';

function getReports(reports) {
  const data = {
    draft: [],
    complete: [],
    uploaded: []
  };
  Object.keys(reports).forEach((key) => {
    const report = reports[key];
    if (data[report.status]) {
      data[report.status].push({
        title: key,
        position: report.position,
        date: report.date
      });
    }
  });
  return data;
}

function mapStateToProps(state) {
  return {
    reports: getReports(state.reports.list),
    stateReports: state.reports,
    form: state.form
  };
}

function mapDispatchToProps(dispatch) {
  return {
    submitForm: (template, reportName, answers) => {
      const fields = getFormFields(template, answers);
      dispatch(uploadReport({ reportName, fields }));
      dispatch(setCanDisplayAlerts(true));
    }
  };
}

function mergeProps({ form, stateReports, ...state }, { submitForm, ...dispatch }, ownProps) {
  return {
    ...ownProps,
    ...state,
    ...dispatch,
    getLastStep: (formName) => {
      const answers = Object.keys(getAnswers(form, formName));
      if (answers.length) {
        const templateId = stateReports.list[formName].area.templateId || 'default';
        const questions = stateReports.templates[templateId].questions;
        const last = Math.max(...answers.map(answer => questions.findIndex(question => answer === question.name)));
        return last < (questions.length - 1) ? last : null;
      }
      // we need to return 0 in case that answers.length === 0, because that means that a form was created but no answer was submitted
      return 0;
    },
    finish: (formName) => {
      const templateId = stateReports.list[formName].area.templateId || 'default';
      const answers = Object.keys(getAnswers(form, formName));
      submitForm(stateReports.templates[templateId], formName, answers);
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Reports);
