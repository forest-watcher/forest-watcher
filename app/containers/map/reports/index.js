// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DEFAULT_LAYER_SETTINGS } from 'redux-modules/layerSettings';
import Reports from 'components/map/reports';
import { getReports } from 'containers/reports';
import type { FormattedReport } from 'containers/reports';

function mapStateToProps(state: State, ownProps: { featureId: string }) {
  const { featureId } = ownProps;
  const formattedReports = getReports(state.reports.list, state.areas.data, state.user.data.id);
  const allReports: Array<FormattedReport> = [
    ...formattedReports.draft,
    ...formattedReports.complete,
    ...formattedReports.uploaded
  ];
  const myReports = allReports.filter((report: FormattedReport) => !report.imported);
  const importedReports = allReports.filter((report: FormattedReport) => report.imported);
  const reportLayerSettings = state.layerSettings?.[featureId]?.reports || DEFAULT_LAYER_SETTINGS.reports;
  return {
    myReports,
    importedReports,
    reportLayerSettings
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators({}, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Reports);
