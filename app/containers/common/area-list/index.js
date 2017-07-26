import { connect } from 'react-redux';

import AreaList from 'components/common/area-list';

// TODO: remove this
function mapStateToProps(state) {
  const { images, data } = state.areas;
  const areas = data.map((area) => {
    if (images[area.id]) {
      return { ...area, image: images[area.id] };
    }
    return area;
  });
  return {
    areas
  };
}

export default connect(
  mapStateToProps,
  null
)(AreaList);
