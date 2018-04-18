// @flow

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrySync } from 'redux-modules/app';
import { getTotalActionsPending } from 'helpers/sync';
import isEmpty from 'lodash/isEmpty';

import Sync from 'components/sync';

function mapStateToProps(state) {
  const hasAreas = !!state.areas.data.length;
  const hasAlerts = !isEmpty(state.alerts.cache);

  return {
    criticalSyncError: (!hasAreas && state.areas.syncError) || (!hasAlerts && state.alerts.syncError),
    isConnected: state.offline.online,
    actionsPending: getTotalActionsPending(state)
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  retrySync
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sync);
