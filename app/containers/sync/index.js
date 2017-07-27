import { connect } from 'react-redux';
import { syncApp, retrySync, setSyncModal, setSyncSkip } from 'redux-modules/app';
import { getTotalActionsPending } from 'helpers/sync';
import isEmpty from 'lodash/isEmpty';

import Sync from 'components/sync';

function mapStateToProps(state) {
  const hasAreas = !!state.areas.data.length;
  const hasAlerts = !isEmpty(state.alerts.cache);

  return {
    criticalSyncError: (!hasAreas && state.areas.syncError) || (!hasAlerts && state.alerts.syncError),
    isConnected: state.offline.online,
    skipAllowed: (hasAreas && hasAlerts),
    reach: state.offline.netInfo && state.offline.netInfo.reach,
    actionsPending: getTotalActionsPending(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    syncApp: () => dispatch(syncApp()),
    retrySync: () => dispatch(retrySync()),
    setSyncModal: open => dispatch(setSyncModal(open)),
    setSyncSkip: status => dispatch(setSyncSkip(status))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sync);
