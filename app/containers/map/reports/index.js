// @flow
import type { MapboxFeaturePressEvent, ReportFeatureProperties } from 'types/common.types';
import type { Report, SelectedReport } from 'types/reports.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DEFAULT_LAYER_SETTINGS } from 'redux-modules/layerSettings';
import Reports, { type ReportLayerSettings } from 'components/map/reports';
import { getReports } from 'containers/reports';

type OwnProps = {|
  +featureId: string,
  +onShapeSourcePressed?: (MapboxFeaturePressEvent<ReportFeatureProperties>) => void,
  +selectedReports: $ReadOnlyArray<SelectedReport>
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const { featureId } = ownProps;
  const formattedReports = getReports(state.reports.list);
  const allReports: Array<Report> = [
    ...formattedReports.draft,
    ...formattedReports.complete,
    ...formattedReports.uploaded,
    ...formattedReports.imported
  ];
  const myReports = allReports.filter((report: Report) => !report.isImported);
  const importedReports: Array<Report> = allReports.filter((report: Report) => report.isImported);
  const reportLayerSettings: ReportLayerSettings =
    state.layerSettings?.[featureId]?.reports || DEFAULT_LAYER_SETTINGS.reports;
  return {
    myReports,
    importedReports,
    reportLayerSettings
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators({}, dispatch);
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Reports);
