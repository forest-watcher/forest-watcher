import { connect } from 'react-redux';
import AreaList from 'components/common/area-list';

// TODO: remove this
function mapStateToProps(state) {
  const { images, data } = state.areas;
  const { cacheStatus } = state.layers;
  const areas = data.map((area) => ({
    ...area,
    image: images[area.id],
    cacheComplete: cacheStatus[area.id].complete
  }));

  return {
    areas,
    showCache: true
  };
}

export default connect(
  mapStateToProps,
  null
)(AreaList);
