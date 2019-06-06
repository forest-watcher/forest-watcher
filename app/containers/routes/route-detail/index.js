// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSelectedAreaId } from 'redux-modules/areas';

import RouteDetail from 'components/routes/route-detail';

function mapStateToProps(state: State, ownProps: { routeName: string }) {
  return {
    route: state.routes.previousRoutes.find(routeData => routeData.name === ownProps.routeName)
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators(
    {
      setSelectedAreaId
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RouteDetail);
