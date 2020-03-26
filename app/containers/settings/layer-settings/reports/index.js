// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { toggleMyReportsLayer, toggleImportedReportsLayer } from 'redux-modules/layerSettings';
import ReportLayerSettings from 'components/settings/layer-settings/reports';

function mapStateToProps(state: State) {
  return {
    reportsLayerSettings: state.layerSettings.reports
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
