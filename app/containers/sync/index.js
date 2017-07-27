import { connect } from 'react-redux';
import { syncApp, setSyncModal, setSyncSkip } from 'redux-modules/app';
import { getTotalActionsPending } from 'helpers/sync';
import isEmpty from 'lodash/isEmpty';

import Sync from 'components/sync';

function mapStateToProps(state) {
  return {
    isConnected: state.offline.online,
    skipAllowed: (!!state.areas.data.length && !isEmpty(state.alerts.cache)),
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
