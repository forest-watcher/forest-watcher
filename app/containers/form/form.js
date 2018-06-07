// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';

import ReportForm from 'components/form';

const mapStateToProps = (state: State, ownProps: { reportName: string }) => {
  const report = state.reports.list[ownProps.reportName];
  return { report };
};

export default connect(mapStateToProps)(ReportForm);
