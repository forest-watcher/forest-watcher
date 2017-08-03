import { connect } from 'react-redux';

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

export default connect(
  mapStateToProps,
  null
)(AreaList);
