import { connect } from 'react-redux';

import NewReport from 'components/reports/new';
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
    answers: getAnswers(state.form)
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewReport);
