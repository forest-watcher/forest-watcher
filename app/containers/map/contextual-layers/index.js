// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { ContextualLayerSettingsType } from 'types/layerSettings.types';

import { connect } from 'react-redux';

import ContextualLayers from 'components/map/contextual-layers';
import { shouldBeConnected } from 'helpers/app';

type OwnProps = {|
  +featureId: ?string,
  +layerSettings: ContextualLayerSettingsType
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const activeLayerIds = ownProps.layerSettings.activeContextualLayerIds;
  const importedContextualLayers = [...state.layers.data, ...state.layers.imported].filter(
    layer => layer.type === 'contextual_layer' && activeLayerIds.includes(layer.id)
  );

  return {
    isOfflineMode: !shouldBeConnected(state),
    layers: importedContextualLayers,
    layerCache: state.layers.downloadedLayerProgress
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
