// @flow
import type { State } from 'types/store.types';

import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrySync } from 'redux-modules/app';
import { hasSyncFinished } from 'helpers/sync';
import { shouldBeConnected } from 'helpers/app';

import Sync from 'components/sync';

function mapStateToProps(state: State) {
  const hasAreas = !!state.areas.data.length;
  const hasAlerts = !isEmpty(state.alerts.cache);

  return {
    // TODO: This has been temporarily commented out because Vizzuality server is always returning 500 for VIIRS alerts
    criticalSyncError: (!hasAreas && state.areas.syncError), // || (!hasAlerts && state.alerts.syncError),
    isConnected: shouldBeConnected(state),
    syncFinished: hasSyncFinished(state)
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      retrySync
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sync);
