import { connect } from 'react-redux';
import { saveReport, finishReport } from 'redux-modules/reports';

import ReportForm from 'components/reports/form';

function mapDispatchToProps(dispatch) {
  return {
    saveReport: (reportName, params) => {
      dispatch(saveReport(reportName, params));
    },
    finish: (form) => {
      dispatch(finishReport(form));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(ReportForm);
