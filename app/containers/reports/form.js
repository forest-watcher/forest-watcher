import { connect } from 'react-redux';
import { saveReport, finishReport } from 'redux-modules/reports';
import { setCanDisplayAlerts } from 'redux-modules/alerts';

import ReportForm from 'components/reports/form';

function mapDispatchToProps(dispatch) {
  return {
    saveReport: (reportName, params) => {
      dispatch(saveReport(reportName, params));
    },
    finish: (form) => {
      dispatch(finishReport(form));
      dispatch(setCanDisplayAlerts(true));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(ReportForm);
