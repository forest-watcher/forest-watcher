// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';

import RouteList from 'components/common/route-list';

function mapStateToProps(state: State) {
  return {
    routes: state.routes.previousRoutes
  };
}

export default connect(
  mapStateToProps,
  null
)(RouteList);
