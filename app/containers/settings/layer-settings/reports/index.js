// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toggleMyReportsLayer, toggleImportedReportsLayer, DEFAULT_LAYER_SETTINGS } from 'redux-modules/layerSettings';
import ReportLayerSettings from 'components/settings/layer-settings/reports';

function mapStateToProps(state: State, ownProps) {
  return {
    featureId: ownProps.featureId,
    reportsLayerSettings: state.layerSettings?.[ownProps.featureId]?.reports || DEFAULT_LAYER_SETTINGS.reports
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      toggleMyReportsLayer,
      toggleImportedReportsLayer
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReportLayerSettings);
