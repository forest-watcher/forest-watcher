import { connect } from 'react-redux';
import { getQuestions } from 'redux-modules/reports';

import NewReport from 'components/reports/new';
import CONSTANTS from 'config/constants';

const defaultReport = CONSTANTS.reports.default;

 // TODO: handle form identifier
function getFormId(params) {
  if (!params) return defaultReport;
  return params.alert;
}

function getAnswers(form) {
  if (!form) return null;
  if (form[defaultReport] && form[defaultReport].values) return form[defaultReport].values;
  return {};
}

function mapStateToProps(state, { navigation }) {
  return {
    questions: state.reports.forms.questions || [],
    form: getFormId(navigation.state.params),
    answers: getAnswers(state.form)
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    getQuestions: () => {
      dispatch(getQuestions());
    },
    goBack: () => {
      navigation.goBack();
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewReport);
