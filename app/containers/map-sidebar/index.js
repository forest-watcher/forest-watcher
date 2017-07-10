import { connect } from 'react-redux';
import { setActiveContextualLayer } from 'redux-modules/layers';

import MapSidebar from 'components/map-sidebar';

function mapStateToProps(state) {
  return {
    layers: state.layers.data,
    activeLayer: state.layers.activeLayer
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onLayerToggle: (layerId, value) => {
      dispatch(setActiveContextualLayer(layerId, value));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapSidebar);
