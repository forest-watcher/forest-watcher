import { connect } from 'react-redux';
import { downloadAreaById, resetCacheStatus, refreshAreaCacheById } from 'redux-modules/layers';
import { shouldBeConnected } from 'helpers/app';
import AreaCache from 'components/common/area-list/area-cache';

const getAreaPendingCache = (areaId, pendingCache) => Object.values(pendingCache)
    .map((areas) => (typeof areas[areaId] !== 'undefined' ? 1 : 0))
    .reduce((acc, next) => acc + next, 0);

function mapStateToProps(state, { areaId }) {
  const cacheStatus = state.layers.cacheStatus[areaId];
  return {
    cacheStatus,
    isConnected: shouldBeConnected(state),
    pendingCache: getAreaPendingCache(areaId, state.layers.pendingCache)
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
