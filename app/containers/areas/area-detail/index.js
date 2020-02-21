// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateArea, deleteArea, setSelectedAreaId } from 'redux-modules/areas';
import { shouldBeConnected } from 'helpers/app';
import AreaDetail from 'components/areas/area-detail';

function mapStateToProps(state: State, { id }) {
  const area = state.areas.data.find(areaData => areaData.id === id);
  return {
    area,
    isConnected: shouldBeConnected(state),
    routes: (state.routes.previousRoutes ?? []).filter(route => route.areaId === id)
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators(
    {
      updateArea,
      deleteArea,
      setSelectedAreaId
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaDetail);
