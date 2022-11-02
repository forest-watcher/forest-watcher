// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import Dashboard from 'components/dashboard';
import {
  updateApp,
  setPristineCacheTooltip,
  showNotConnectedNotification,
  setWelcomeScreenSeen,
  checkAppVersion
} from 'redux-modules/app';
import { setAreasRefreshing } from 'redux-modules/areas';
import { isOutdated } from 'helpers/date';
import { hasSeenLatestWhatsNewOrWelcomeScreen, shouldBeConnected } from 'helpers/app';
import { syncTeams } from '../../redux-modules/teams';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  const areasOutdated = !state.areas.synced || isOutdated(state.areas.syncDate);
  const appSyncing = state.areas.syncing || state.layers.syncing || state.alerts.queue.length > 0;
  const isConnected = shouldBeConnected(state);
  const loggedIn = state.user.loggedIn;
  return {
    appSyncing,
    isConnected,
    areasOutdated,
    refreshing: state.areas.refreshing,
    pristine: state.app.pristineCacheTooltip,
    hasSeenWelcomeScreen: hasSeenLatestWhatsNewOrWelcomeScreen(state),
    needsUpdate: areasOutdated && !appSyncing && isConnected && loggedIn,
    invites: state.teams.invites,
    needsAppUpdate: state.app.needsAppUpdate,
    isAppUpdate: state.app.isUpdate
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    setAreasRefreshing: (refreshing: boolean) => {
      dispatch(setAreasRefreshing(refreshing));
    },
    setPristine: (pristine: boolean) => {
      dispatch(setPristineCacheTooltip(pristine));
    },
    setWelcomeScreenSeen: () => {
      dispatch(setWelcomeScreenSeen());
    },
    showNotConnectedNotification: () => {
      dispatch(showNotConnectedNotification());
    },
    updateApp: () => {
      dispatch(updateApp());
    },
    getTeamInvites: () => {
      dispatch(syncTeams());
    },
    checkAppVersion: () => {
      dispatch(checkAppVersion());
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
