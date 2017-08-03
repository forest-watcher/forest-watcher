import { connect } from 'react-redux';
import { downloadArea } from 'redux-modules/layers';
import AreaList from 'components/common/area-list';

// TODO: remove this
function mapStateToProps(state) {
  const { images, data } = state.areas;
  const { cacheProgress } = state.layers;
  const areas = data.map((area) => {
    if (images[area.id]) {
      return { ...area, image: images[area.id] };
    }
    return area;
  });

  return {
    areas,
    cacheProgress
  };
}

function mapDispatchToProps(dispatch) {
  return {
    downloadArea: areaId => dispatch(downloadArea(areaId))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaList);
