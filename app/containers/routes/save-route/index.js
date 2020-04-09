// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';

import SaveRoute from 'components/routes/save-route';
import { finishAndSaveRoute, updateActiveRoute } from 'redux-modules/routes';
import { copyLayerSettings } from 'redux-modules/layerSettings';
import type { Route } from 'types/routes.types';

function mapStateToProps(state: State) {
  return {
    route: state.routes.activeRoute
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateActiveRoute: (route: Route, areaId: string) => {
      dispatch(updateActiveRoute(route));
      dispatch(copyLayerSettings(areaId, route.id));
    },
    finishAndSaveRoute: () => {
      dispatch(finishAndSaveRoute());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SaveRoute);
