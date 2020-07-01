// @flow
import type { Route } from 'types/routes.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import RouteDetail from 'components/routes/route-detail';

import { deleteRoutes, updateSavedRoute } from 'redux-modules/routes';

type OwnProps = {|
  +componentId: string,
  routeId: string
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {
    coordinatesFormat: state.app.coordinatesFormat,
    route: state.routes.previousRoutes.find(routeData => routeData.id === ownProps.routeId)
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps) {
  return {
    deleteRoute: () => {
      dispatch(
        deleteRoutes({
          id: ownProps.routeId
        })
      );
    },
    updateRoute: (updatedFields: $Shape<Route>) => {
      dispatch(
        updateSavedRoute({
          ...updatedFields,
          id: ownProps.routeId
        })
      );
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(RouteDetail);
