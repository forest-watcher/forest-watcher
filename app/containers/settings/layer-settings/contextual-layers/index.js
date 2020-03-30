// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ContextualLayersLayerSettings from 'components/settings/layer-settings/contextual-layers';

import { clearEnabledContextualLayers, setContextualLayerShowing } from 'redux-modules/layerSettings';

function mapStateToProps(state: State) {
  return {
    contextualLayersLayerSettings: state.layerSettings.contextualLayers,
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
