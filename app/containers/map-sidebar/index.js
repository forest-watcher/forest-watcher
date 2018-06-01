// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setActiveContextualLayer } from 'redux-modules/layers';
import MapSidebar from 'components/map-sidebar';
import { getSelectedArea } from 'helpers/area';


function mapStateToProps(state: State) {
  const area = getSelectedArea(state.areas.data, state.areas.selectedAreaId);

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
