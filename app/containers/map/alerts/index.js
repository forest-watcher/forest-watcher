// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DEFAULT_LAYER_SETTINGS } from 'redux-modules/layerSettings';
import Alerts from 'components/map/alerts';

type OwnProps = {|
  areaId: string,
  featureId: string
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const { featureId } = ownProps;

  const alertLayerSettings = state.layerSettings?.[featureId]?.alerts || DEFAULT_LAYER_SETTINGS.alerts;

  return {
    alertLayerSettings
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators({}, dispatch);
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Alerts);
