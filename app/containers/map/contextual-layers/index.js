// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';

import { DEFAULT_LAYER_SETTINGS } from 'redux-modules/layerSettings';

import ContextualLayers from 'components/map/contextual-layers';

type OwnProps = {|
  +featureId: ?string
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const featureId = ownProps.featureId;
  const layerSettings = state.layerSettings?.[featureId] || DEFAULT_LAYER_SETTINGS;
  const activeLayerIds = layerSettings.contextualLayers.activeContextualLayerIds;
  const importedContextualLayers = [...state.layers.imported].filter(layer => activeLayerIds.includes(layer.id));

  return {
    downloadedLayerCache: state.layers.downloadedLayerProgress,
    featureId,
    importedContextualLayers
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {};
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ContextualLayers);
