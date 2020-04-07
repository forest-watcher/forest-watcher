// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MapSidebar from 'components/map-sidebar';
import {
  toggleAlertsLayer,
  toggleRoutesLayer,
  toggleReportsLayer,
  toggleContextualLayersLayer,
  getActiveBasemap,
  DEFAULT_LAYER_SETTINGS
} from 'redux-modules/layerSettings';

function mapStateToProps(state: State) {
  return {
    allLayerSettings: state.layerSettings,
    defaultLayerSettings: DEFAULT_LAYER_SETTINGS
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      getActiveBasemap,
      toggleAlertsLayer,
      toggleRoutesLayer,
      toggleReportsLayer,
      toggleContextualLayersLayer
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapSidebar);
