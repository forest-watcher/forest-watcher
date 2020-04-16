// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DEFAULT_LAYER_SETTINGS } from 'redux-modules/layerSettings';
import Alerts from 'components/map/alerts';

function mapStateToProps(state: State, ownProps: { featureId: string, areaId: string }) {
  const { featureId, areaId } = ownProps;
  const gladAlerts = state.alerts.data[areaId]?.umd_as_it_happens?.alerts;
  const viirsAlerts = state.alerts.data[areaId]?.viirs?.alerts;

  const layerSettings = state.layerSettings[featureId] || DEFAULT_LAYER_SETTINGS;

  return {
    gladAlerts,
    viirsAlerts,
    layerSettings
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators({}, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Alerts);
