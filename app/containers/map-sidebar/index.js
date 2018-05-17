// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setActiveContextualLayer } from 'redux-modules/layers';
import { activeDataset } from 'helpers/area';
import { DATASETS } from 'config/constants';
import { hexToRgb } from 'helpers/utils';
import Theme from 'config/theme';
import MapSidebar from 'components/map-sidebar';


function mapStateToProps(state: State) {
  const index = state.areas.selectedIndex;
  const area = state.areas.data[index] || null;
  const showLegend = state.layers.showLegend;
  let legend = null;
  if (area) {
    const dataset = activeDataset(area);
    if (dataset && showLegend) {
      const color = dataset.slug === DATASETS.VIIRS ? Theme.colors.colorViirs : Theme.colors.colorGlad;
      legend = {
        title: `datasets.${dataset.slug}`,
        color: `rgba(${hexToRgb(color)}, 0.7)`
      };
    }
  }
  return {
    layers: state.layers.data,
    activeLayer: state.layers.activeLayer,
    legend
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  onLayerToggle: setActiveContextualLayer
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapSidebar);
