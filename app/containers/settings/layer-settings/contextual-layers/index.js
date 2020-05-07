// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ContextualLayersLayerSettings from 'components/settings/layer-settings/contextual-layers';
import {
  clearEnabledContextualLayers,
  DEFAULT_LAYER_SETTINGS,
  setContextualLayerShowing
} from 'redux-modules/layerSettings';

type OwnProps = {|
  +componentId: string,
  featureId: string
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {
    baseApiLayers: state.layers.data || [],
    featureId: ownProps.featureId,
    contextualLayersLayerSettings:
      state.layerSettings?.[ownProps.featureId]?.contextualLayers || DEFAULT_LAYER_SETTINGS.contextualLayers,
    importedContextualLayers: state.layers.imported
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      clearEnabledContextualLayers,
      setContextualLayerShowing
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ContextualLayersLayerSettings);
