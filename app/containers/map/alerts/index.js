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

  const alertLayerSettings = state.layerSettings?.[featureId]?.alerts || DEFAULT_LAYER_SETTINGS.alerts;

  return {
    gladAlerts,
    viirsAlerts,
    alertLayerSettings
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators({}, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Alerts);
