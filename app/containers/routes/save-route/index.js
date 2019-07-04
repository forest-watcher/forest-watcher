// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';

import SaveRoute from 'components/routes/save-route';
import { finishAndSaveRoute, updateActiveRoute } from 'redux-modules/routes';

function mapStateToProps(state: State) {
  return {
    route: state.routes.activeRoute
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateActiveRoute: route => {
      dispatch(updateActiveRoute(route));
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
