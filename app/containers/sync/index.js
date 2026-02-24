// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { retrySync } from 'redux-modules/app';
import { hasSyncFinished } from 'helpers/sync';
import { shouldBeConnected } from 'helpers/app';

import Sync from 'components/sync';
import * as Sentry from '@sentry/react-native';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  const hasAreas = !!state.areas.data.length;
  const hasAlerts = !isEmpty(state.alerts.cache);
  const criticalSyncError = (!hasAreas && state.areas.syncError) || (!hasAlerts && state.alerts.syncError);
  if (criticalSyncError) {
    Sentry.captureException(
      new Error(
        `Critical sync error: ${String(hasAreas)} ${String(hasAlerts)} ${String(state.areas.syncError)} ${String(
          state.alerts.syncError
        )}`
      )
    );
  }

  return {
    criticalSyncError,
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
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(mapStateToProps, mapDispatchToProps)(Sync);
