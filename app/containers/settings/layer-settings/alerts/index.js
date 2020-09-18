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

type OwnProps = {|
  +componentId: string,
  +featureId: string
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {
    featureId: ownProps.featureId,
    alertLayerSettings: state.layerSettings?.[ownProps.featureId]?.alerts || DEFAULT_LAYER_SETTINGS.alerts,
    area: state.areas.data.find(item => item.id === ownProps.featureId)
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
