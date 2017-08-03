import { connect } from 'react-redux';
import { downloadAreaById } from 'redux-modules/layers';
import AreaCache from 'components/common/area-list/area-cache';

// TODO: remove this
function mapStateToProps(state, { areaId }) {
  const cacheStatus = state.layers.cacheStatus[areaId];
  return {
    cacheStatus
  };
}

function mapDispatchToProps(dispatch) {
  return {
    downloadAreaById: areaId => dispatch(downloadAreaById(areaId))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaCache);
