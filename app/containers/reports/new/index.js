import { connect } from 'react-redux';
import { saveReport } from 'redux-modules/reports';

import NewReport from 'components/reports/new';

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    saveReport: (reportName, params) => {
      dispatch(saveReport(reportName, params));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewReport);
