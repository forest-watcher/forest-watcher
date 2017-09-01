import { connect } from 'react-redux';
import { setActiveContextualLayer } from 'redux-modules/layers';
import { activeDataset } from 'helpers/area';
import CONSTANTS from 'config/constants';
import { hexToRgb } from 'helpers/utils';
import Theme from 'config/theme';
import MapSidebar from 'components/map-sidebar';


function mapStateToProps(state) {
  const index = state.areas.selectedIndex;
  const area = state.areas.data[index] || null;
  let legend = false;
  if (area) {
    const dataset = activeDataset(area);
    if (dataset) {
      const color = dataset.slug === CONSTANTS.datasets.VIIRS ? Theme.colors.colorViirs : Theme.colors.colorGlad;
      legend = {
        title: dataset.name,
        color: `rgba(${hexToRgb(color)}, 0.7)`
      };
    }
  }
  return {
    layers: state.layers.data,
    activeLayer: state.layers.activeLayer,
    legend,
    showLegend: state.app.showLegend
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
