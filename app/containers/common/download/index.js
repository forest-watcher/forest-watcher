// @flow
import type { DownloadDataType } from 'types/sharing.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  downloadAreaById,
  resetCacheStatus,
  refreshCacheById,
  downloadRouteById,
  calculateOverallDownloadProgressForRegion
} from 'redux-modules/layers/downloadLayer';
import { showNotConnectedNotification } from 'redux-modules/app';
import DataCacher from 'components/common/download';
import { GFW_BASEMAPS } from 'config/constants';

type OwnProps = {|
  +dataType: DownloadDataType,
  +id: string,
  +showTooltip: boolean
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const { id } = ownProps;

  const downloadProgress = state.layers.downloadedLayerProgress;
  const expectedLayerTotal = state.layers.data.length + state.layers.imported.length + GFW_BASEMAPS.length;

  const overallCacheStatus = calculateOverallDownloadProgressForRegion(id, downloadProgress, expectedLayerTotal);

  return {
    downloadProgress: overallCacheStatus,
    isOfflineMode: state.app.offlineMode
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
