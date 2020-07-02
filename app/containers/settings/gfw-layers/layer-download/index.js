// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LayerDownload from 'components/settings/gfw-layers/layer-download';
import { showNotConnectedNotification } from 'redux-modules/app';
import { importGFWContent } from 'redux-modules/layers';

import type { MapContent, LayersCacheStatus } from 'types/layers.types';

type OwnProps = {|
  +componentId: string,
  downloadProgress: ?LayersCacheStatus,
  layer: MapContent,
  popToComponentId: string
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {
    downloadProgress: state.layers.downloadedLayerProgress[ownProps.layer.id],
    offlineMode: state.app.offlineMode
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      addLayer: importGFWContent,
      showNotConnectedNotification
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(LayerDownload);
