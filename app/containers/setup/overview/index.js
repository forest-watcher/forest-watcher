// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SetupOverview from 'components/setup/overview';
import { saveArea } from 'redux-modules/areas';

function mapStateToProps(state: State) {
  return {
    area: state.setup.area,
    snapshot: state.setup.snapshot,
    areaSaved: state.setup.areaSaved
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  saveArea
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupOverview);
