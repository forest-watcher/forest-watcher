// @flow
import type { State } from 'types/store.types';
import type { LayersPendingCache } from 'types/layers.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { downloadAreaById, resetCacheStatus, refreshAreaCacheById } from 'redux-modules/layers';
import { showConnectionRequired } from 'redux-modules/app';
import { shouldBeConnected } from 'helpers/app';
import AreaCache from 'components/common/area-list/area-cache';

const getAreaPendingCache = (areaId: string, pendingCache: LayersPendingCache) => Object.values(pendingCache)
    .map((areas) => (typeof areas[areaId] !== 'undefined' ? 1 : 0))
    .reduce((acc, next) => acc + next, 0);

function mapStateToProps(state: State, ownProps: { areaId: string }) {
  const { areaId } = ownProps;
  const cacheStatus = state.layers.cacheStatus[areaId];
  return {
    cacheStatus,
    isConnected: shouldBeConnected(state),
    pendingCache: getAreaPendingCache(areaId, state.layers.pendingCache)
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  downloadAreaById,
  resetCacheStatus,
  refreshAreaCacheById,
  showConnectionRequired
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaCache);
