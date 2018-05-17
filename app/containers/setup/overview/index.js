// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { saveArea } from 'redux-modules/areas';
import { setSetupArea } from 'redux-modules/setup';
import SetupOverview from 'components/setup/overview';

function mapStateToProps(state: State) {
  return {
    area: state.setup.area,
    snapshot: state.setup.snapshot
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  saveArea,
  setSetupArea
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupOverview);
