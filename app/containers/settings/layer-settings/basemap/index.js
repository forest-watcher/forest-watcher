// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BasemapLayerSettings from 'components/settings/layer-settings/basemap';
import { DEFAULT_LAYER_SETTINGS, selectActiveBasemap } from 'redux-modules/layerSettings';

type OwnProps = {|
  +componentId: string,
  featureId: string
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {
    featureId: ownProps.featureId,
    basemaps: state.layers.imported.filter(importedLayer => importedLayer.type === 'basemap'),
    offlineMode: state.app.offlineMode,
    activeBasemapId:
      state.layerSettings?.[ownProps.featureId]?.basemap.activeBasemapId ||
      DEFAULT_LAYER_SETTINGS.basemap.activeBasemapId
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      selectActiveBasemap
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(BasemapLayerSettings);
