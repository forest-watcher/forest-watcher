// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MapSidebar from 'components/map-sidebar';
import {
  toggleAlertsLayer,
  toggleRoutesLayer,
  toggleReportsLayer,
  toggleContextualLayersLayer
} from 'redux-modules/layerSettings';

function mapStateToProps(state: State) {
  return {
    layerSettings: state.layerSettings
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
