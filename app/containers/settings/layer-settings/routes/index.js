// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DEFAULT_LAYER_SETTINGS, deselectAllRoutes, toggleRouteSelected } from 'redux-modules/layerSettings';
import RoutesLayerSettings from 'components/settings/layer-settings/routes';
import { getAllRouteIds } from 'redux-modules/routes';

type OwnProps = {|
  +componentId: string,
  featureId: string
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {
    featureId: ownProps.featureId,
    routes: state.routes.previousRoutes,
    routesLayerSettings: state.layerSettings?.[ownProps.featureId]?.routes || DEFAULT_LAYER_SETTINGS.routes
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    ...bindActionCreators(
      {
        deselectAllRoutes
      },
      dispatch
    ),
    toggleRouteSelected: (featureId: string, routeId: string) => {
      const allRouteIds = dispatch(getAllRouteIds());
      dispatch(toggleRouteSelected(featureId, routeId, allRouteIds));
    }
  };
};

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(RoutesLayerSettings);
