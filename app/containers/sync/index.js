// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrySync } from 'redux-modules/app';
import { hasSyncFinished } from 'helpers/sync';
import { shouldBeConnected } from 'helpers/app';

import Sync from 'components/sync';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  const hasAreas = !!state.areas.data.length;
  const hasAlerts = !isEmpty(state.alerts.cache);

  return {
    criticalSyncError: (!hasAreas && state.areas.syncError) || (!hasAlerts && state.alerts.syncError),
    isConnected: shouldBeConnected(state),
    syncFinished: hasSyncFinished(state)
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      retrySync
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Sync);
