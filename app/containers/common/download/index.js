// @flow
import type { DownloadDataType } from 'types/sharing.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { LayersPendingCache } from 'types/layers.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { downloadAreaById, resetCacheStatus, refreshAreaCacheById } from 'redux-modules/layers';
import { showNotConnectedNotification } from 'redux-modules/app';
import DataCacher from 'components/common/download';

type OwnProps = {|
  +dataType: DownloadDataType,
  +disabled: boolean,
  +id: string,
  +showTooltip: boolean
|};

const getAreaPendingCache = (areaId: string, pendingCache: LayersPendingCache) =>
  Object.values(pendingCache)
    // $FlowFixMe
    .map(areas => (typeof areas[areaId] !== 'undefined' ? 1 : 0))
    .reduce((acc, next) => acc + next, 0);

function mapStateToProps(state: State, ownProps: OwnProps) {
  const { id } = ownProps;
  // TODO: Update route state with cache status
  const cacheStatus =
    ownProps.dataType === 'area'
      ? state.layers.cacheStatus[id]
      : { requested: false, progress: 0, error: false, completed: false };
  return {
    cacheStatus,
    isOfflineMode: state.app.offlineMode,
    pendingCache: ownProps.dataType === 'area' ? getAreaPendingCache(id, state.layers.pendingCache) : 0
  };
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) =>
  bindActionCreators(
    {
      downloadById: ownProps.dataType === 'area' ? downloadAreaById : () => {},
      resetCacheStatus,
      refreshCacheById: ownProps.dataType === 'area' ? refreshAreaCacheById : () => {},
      showNotConnectedNotification
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(DataCacher);
