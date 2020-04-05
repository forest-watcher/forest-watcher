// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  DEFAULT_LAYER_SETTINGS,
  setGladAlertsTimeFrame,
  setViirsAlertsTimeFrame,
  toggleGladAlerts,
  toggleViirsAlerts
} from 'redux-modules/layerSettings';
import AlertLayerSettings from 'components/settings/layer-settings/alerts';

function mapStateToProps(state: State, ownProps) {
  return {
    featureId: ownProps.featureId,
    alertLayerSettings: state.layerSettings?.[ownProps.featureId]?.alerts || DEFAULT_LAYER_SETTINGS.alerts
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      toggleGladAlerts,
      toggleViirsAlerts,
      setGladAlertsTimeFrame,
      setViirsAlertsTimeFrame
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertLayerSettings);
