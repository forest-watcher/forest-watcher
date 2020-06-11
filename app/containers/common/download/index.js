// @flow
import type { DownloadDataType } from 'types/sharing.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { LayersPendingCache } from 'types/layers.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { downloadAreaById, resetCacheStatus, refreshCacheById, downloadRouteById } from 'redux-modules/layers';
import { showNotConnectedNotification } from 'redux-modules/app';
import DataCacher from 'components/common/download';

type OwnProps = {|
  +dataType: DownloadDataType,
  +disabled: boolean,
  +id: string,
  +showTooltip: boolean
|};

const getPendingCache = (id: string, pendingCache: LayersPendingCache) =>
  Object.values(pendingCache)
    // $FlowFixMe
    .map(caches => (typeof caches[id] !== 'undefined' ? 1 : 0))
    .reduce((acc, next) => acc + next, 0);

function mapStateToProps(state: State, ownProps: OwnProps) {
  const { id } = ownProps;

  return {
    cacheStatus: state.layers.cacheStatus[id],
    isOfflineMode: state.app.offlineMode,
    pendingCache: getPendingCache(id, state.layers.pendingCache)
  };
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) =>
  bindActionCreators(
    {
      downloadById: ownProps.dataType === 'area' ? downloadAreaById : downloadRouteById,
      resetCacheStatus,
      refreshCacheById,
      showNotConnectedNotification
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(DataCacher);
