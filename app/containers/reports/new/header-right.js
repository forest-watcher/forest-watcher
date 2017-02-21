import { connect } from 'react-redux';
import { saveReport } from 'redux-modules/reports';

import HeaderRight from 'components/reports/new/header/right';
import CONSTANTS from 'config/constants';

const defaultReport = CONSTANTS.reports.default;

function mapStateToProps() {
  return {
    report: defaultReport
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveReport: (report) => {
      dispatch(saveReport(report));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderRight);
