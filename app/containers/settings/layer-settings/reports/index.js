// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toggleMyReportsLayer, toggleImportedReportsLayer, DEFAULT_LAYER_SETTINGS } from 'redux-modules/layerSettings';
import ReportLayerSettings from 'components/settings/layer-settings/reports';

type OwnProps = {|
  +componentId: string,
  featureId: string
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {
    featureId: ownProps.featureId,
    reportsLayerSettings: state.layerSettings?.[ownProps.featureId]?.reports || DEFAULT_LAYER_SETTINGS.reports
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      toggleMyReportsLayer,
      toggleImportedReportsLayer
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ReportLayerSettings);
