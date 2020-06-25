// @flow
import type { Area } from 'types/areas.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';

import { DEFAULT_LAYER_SETTINGS } from 'redux-modules/layerSettings';

import { getSelectedArea } from 'helpers/area';

import ContextualLayers from 'components/map/contextual-layers';

type OwnProps = {||};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const area: ?Area = getSelectedArea(state.areas.data, state.areas.selectedAreaId);

  const route = state.routes.activeRoute;
  const featureId = area?.id || route?.id || '';
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
