// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { ContextualLayerSettingsType } from 'types/layerSettings.types';

import { connect } from 'react-redux';

import ContextualLayers from 'components/map/contextual-layers';

type OwnProps = {|
  +featureId: ?string,
  +layerSettings: ContextualLayerSettingsType
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const activeLayerIds = ownProps.layerSettings.activeContextualLayerIds;
  const importedContextualLayers = state.layers.imported.filter(layer => activeLayerIds.includes(layer.id));

  return {
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
