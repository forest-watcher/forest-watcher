import { connect } from 'react-redux';
import { syncApp, setSyncModal, setSyncSkip } from 'redux-modules/app';
import { getTotalActionsPending } from 'helpers/sync';

import Sync from 'components/sync';

function mapStateToProps(state) {
  return {
    isConnected: state.offline.online,
    hasAreas: !!state.areas.data.length,
    reach: state.offline.netInfo && state.offline.netInfo.reach,
    actionsPending: getTotalActionsPending(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    syncApp: () => dispatch(syncApp()),
    setSyncModal: open => dispatch(setSyncModal(open)),
    setSyncSkip: status => dispatch(setSyncSkip(status))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sync);
