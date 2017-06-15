import { connect } from 'react-redux';

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
    reports: getReports(state.reports.list)
  };
}

export default connect(
  mapStateToProps,
  null
)(Reports);
