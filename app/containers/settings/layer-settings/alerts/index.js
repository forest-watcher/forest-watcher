// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

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

type OwnProps = {|
  +componentId: string,
  featureId: string
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const area = getSelectedArea(state.areas.data, state.areas.selectedAreaId);
  return {
    featureId: ownProps.featureId,
    alertLayerSettings: state.layerSettings?.[ownProps.featureId]?.alerts || DEFAULT_LAYER_SETTINGS.alerts,
    area
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      toggleGladAlerts,
      toggleViirsAlerts,
      setGladAlertsTimeFrame,
      setViirsAlertsTimeFrame
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(AlertLayerSettings);
