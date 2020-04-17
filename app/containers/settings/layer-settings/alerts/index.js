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
import { getSelectedArea } from 'helpers/area';

function mapStateToProps(state: State, ownProps) {
  const area = getSelectedArea(state.areas.data, state.areas.selectedAreaId);
  return {
    featureId: ownProps.featureId,
    alertLayerSettings: state.layerSettings?.[ownProps.featureId]?.alerts || DEFAULT_LAYER_SETTINGS.alerts,
    area
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
