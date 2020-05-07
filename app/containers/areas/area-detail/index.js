// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateArea, deleteArea, setSelectedAreaId } from 'redux-modules/areas';
import { shouldBeConnected } from 'helpers/app';
import AreaDetail from 'components/areas/area-detail';
import { initialiseAreaLayerSettings } from 'redux-modules/layerSettings';

type OwnProps = {|
  +componentId: string,
  disableDelete: boolean,
  id: string
|};

function mapStateToProps(state: State, { id }: OwnProps) {
  const area = state.areas.data.find(areaData => areaData.id === id);

  return {
    area,
    isConnected: shouldBeConnected(state),
    routes: (state.routes.previousRoutes ?? []).filter(route => route.areaId === id)
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      updateArea,
      deleteArea,
      initialiseAreaLayerSettings,
      setSelectedAreaId
    },
    dispatch
  );
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(AreaDetail);
