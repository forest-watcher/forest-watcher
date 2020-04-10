// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  DEFAULT_LAYER_SETTINGS,
  deselectAllRoutes,
  selectAllRoutes,
  toggleRouteSelected
} from 'redux-modules/layerSettings';
import RoutesLayerSettings from 'components/settings/layer-settings/routes';
import { getAllRouteIds } from 'redux-modules/routes';

function mapStateToProps(state: State, ownProps) {
  return {
    featureId: ownProps.featureId,
    myRoutes: state.routes.previousRoutes,
    importedRoutes: state.routes.importedRoutes,
    routesLayerSettings: state.layerSettings?.[ownProps.featureId]?.routes || DEFAULT_LAYER_SETTINGS.routes
  };
}

const mapDispatchToProps = (dispatch: *) => {
  return {
    ...bindActionCreators(
      {
        toggleRouteSelected,
        deselectAllRoutes
      },
      dispatch
    ),
    selectAllRoutes: (featureId: string) => {
      const allRouteIds = dispatch(getAllRouteIds());
      dispatch(selectAllRoutes(featureId, allRouteIds));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RoutesLayerSettings);
