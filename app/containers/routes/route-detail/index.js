// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSelectedAreaId } from 'redux-modules/areas';

import RouteDetail from 'components/routes/route-detail';
import { deleteRoutes } from '../../../redux-modules/routes';

function mapStateToProps(state: State, ownProps: { routeId: string }) {
  return {
    route: state.routes.previousRoutes.find(routeData => routeData.id === ownProps.routeId)
  };
}

function mapDispatchToProps(dispatch, ownProps: { routeId: string }) {
  return {
    deleteRoute: () => {
      dispatch(
        deleteRoutes({
          id: ownProps.routeId
        })
      );
    }
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
