// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BasemapLayerSettings from 'components/settings/layer-settings/basemap';
import { selectActiveBasemap } from 'redux-modules/layerSettings';

function mapStateToProps(state: State) {
  return {
    basemaps: state.basemaps,
    activeBasemapId: state.layerSettings.basemap.activeBasemapId
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
