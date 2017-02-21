import { connect } from 'react-redux';
import { finishReport, getQuestions } from 'redux-modules/reports';

import ReportsForm from 'components/reports/new/form';
import CONSTANTS from 'config/constants';

const defaultReport = CONSTANTS.reports.default;

 // TODO: handle form identifier

function getAnswers(form) {
  if (!form) return null;
  if (form[defaultReport] && form[defaultReport].values) return form[defaultReport].values;
  return {};
}

function mapStateToProps(state) {
  return {
    questions: state.reports.forms.questions || [],
    form: defaultReport,
    answers: getAnswers(state.form)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    finishReport: (report) => {
      dispatch(finishReport(report));
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
