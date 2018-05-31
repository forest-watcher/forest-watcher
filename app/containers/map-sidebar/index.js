// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setActiveContextualLayer } from 'redux-modules/layers';
import MapSidebar from 'components/map-sidebar';


function mapStateToProps(state: State) {
  const index = state.areas.selectedIndex;
  const area = state.areas.data[index] || null;

  return {
    areaId: area && area.id,
    layers: state.layers.data,
    activeLayer: state.layers.activeLayer
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  onLayerToggle: setActiveContextualLayer
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapSidebar);
