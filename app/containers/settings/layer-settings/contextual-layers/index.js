// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ContextualLayersLayerSettings from 'components/settings/layer-settings/contextual-layers';
import {
  clearEnabledContextualLayers,
  DEFAULT_LAYER_SETTINGS,
  setContextualLayerShowing
} from 'redux-modules/layerSettings';

function mapStateToProps(state: State, ownProps) {
  return {
    baseApiLayers: state.layers.data || [],
    featureId: ownProps.featureId,
    contextualLayersLayerSettings:
      state.layerSettings?.[ownProps.featureId]?.contextualLayers || DEFAULT_LAYER_SETTINGS.contextualLayers,
    importedContextualLayers: state.layers.imported
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      clearEnabledContextualLayers,
      setContextualLayerShowing
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextualLayersLayerSettings);
