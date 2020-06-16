// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { saveArea } from 'redux-modules/areas';
import { setSetupArea } from 'redux-modules/setup';
import SetupOverview from 'components/setup/overview';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    area: state.setup.area,
    syncingAreas: state.areas.syncing,
    snapshot: state.setup.snapshot
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      saveArea,
      setSetupArea
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(SetupOverview);
