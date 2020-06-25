// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

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

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    allLayerSettings: state.layerSettings,
    defaultLayerSettings: DEFAULT_LAYER_SETTINGS,
    getActiveBasemap: featureId => getActiveBasemap(featureId, state),
    selectedAreaId: state.areas.selectedAreaId
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      toggleAlertsLayer,
      toggleRoutesLayer,
      toggleReportsLayer,
      toggleContextualLayersLayer
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(MapSidebar);
