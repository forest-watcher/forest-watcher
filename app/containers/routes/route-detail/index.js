// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import RouteDetail from 'components/routes/route-detail';

import { deleteRoutes, updateSavedRoute } from '../../../redux-modules/routes';
import { setSelectedAreaId } from '../../../redux-modules/areas';

function mapStateToProps(state: State, ownProps: { routeId: string }) {
  return {
    coordinatesFormat: state.app.coordinatesFormat,
    route: state.routes.previousRoutes.find(routeData => routeData.id === ownProps.routeId)
  };
}

function mapDispatchToProps(dispatch, ownProps: { routeId: string }) {
  return {
    ...bindActionCreators(
      {
        setSelectedAreaId
      },
      dispatch
    ),
    deleteRoute: () => {
      dispatch(
        deleteRoutes({
          id: ownProps.routeId
        })
      );
    },
    updateRoute: updatedFields => {
      dispatch(
        updateSavedRoute({
          ...updatedFields,
          id: ownProps.routeId
        })
      );
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RouteDetail);
