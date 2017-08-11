import { connect } from 'react-redux';
import { downloadAreaById, resetCacheStatus, refreshAreaCacheById } from 'redux-modules/layers';
import AreaCache from 'components/common/area-list/area-cache';

function mapStateToProps(state, { areaId }) {
  const cacheStatus = state.layers.cacheStatus[areaId];
  return {
    cacheStatus,
    isConnected: state.offline.online
  };
}

function mapDispatchToProps(dispatch) {
  return {
    downloadAreaById: areaId => dispatch(downloadAreaById(areaId)),
    resetCacheStatus: areaId => dispatch(resetCacheStatus(areaId)),
    refreshAreaCacheById: areaId => dispatch(refreshAreaCacheById(areaId))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaCache);
