// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setSelectedAreaId } from 'redux-modules/areas';
import { setAreaDownloadTooltipSeen, showNotConnectedNotification } from 'redux-modules/app';

import Areas from 'components/areas';
import { initialiseAreaLayerSettings } from 'redux-modules/layerSettings';

function mapStateToProps(state: State) {
  return {
    areaDownloadTooltipSeen: state.app.areaDownloadTooltipSeen,
    areas: state.areas.data,
    offlineMode: state.app.offlineMode
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators(
    {
      initialiseAreaLayerSettings,
      setAreaDownloadTooltipSeen,
      setSelectedAreaId,
      showNotConnectedNotification
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Areas);
