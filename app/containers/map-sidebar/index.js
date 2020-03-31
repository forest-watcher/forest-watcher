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
  getActiveBasemap
} from 'redux-modules/layerSettings';

function mapStateToProps(state: State) {
  const activeBasemapName = getActiveBasemap(state).name;
  return {
    layerSettings: state.layerSettings,
    activeBasemapName
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
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
