// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { saveArea } from 'redux-modules/areas';
import { setSetupArea } from 'redux-modules/setup';
import ShapefileOverview from 'components/setup/shapefile';
import { showNotConnectedNotification } from 'redux-modules/app';
import { shouldBeConnected } from 'helpers/app';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    area: state.setup.area,
    syncingAreas: state.areas.syncing,
    isConnected: shouldBeConnected(state)
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      saveArea,
      showNotConnectedNotification,
      setSetupArea
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ShapefileOverview);
