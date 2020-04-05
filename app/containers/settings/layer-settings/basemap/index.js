// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BasemapLayerSettings from 'components/settings/layer-settings/basemap';
import { DEFAULT_LAYER_SETTINGS, selectActiveBasemap } from 'redux-modules/layerSettings';

function mapStateToProps(state: State, ownProps) {
  return {
    featureId: ownProps.featureId,
    basemaps: state.basemaps,
    activeBasemapId:
      state.layerSettings?.[ownProps.featureId]?.basemap.activeBasemapId ||
      DEFAULT_LAYER_SETTINGS.basemap.activeBasemapId
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      selectActiveBasemap
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BasemapLayerSettings);
