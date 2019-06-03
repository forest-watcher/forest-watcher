// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';

import RouteDetail from 'components/routes/route-detail';

function mapStateToProps(state: State, ownProps: { routeName: string }) {
  return {
    route: state.routes.previousRoutes.find(routeData => routeData.name === ownProps.routeName)
  };
}

export default connect(
  mapStateToProps,
  null
)(RouteDetail);
