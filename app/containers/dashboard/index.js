// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import Dashboard from 'components/dashboard';
import {
  updateApp,
  setPristineCacheTooltip,
  showNotConnectedNotification,
  setWelcomeScreenSeen
} from 'redux-modules/app';
import { setAreasRefreshing } from 'redux-modules/areas';
import { isOutdated } from 'helpers/date';
import { hasSeenLatestWhatsNewOrWelcomeScreen, shouldBeConnected } from 'helpers/app';

type OwnProps = {|
  +componentId: string
|};

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
    activeRoute: state.routes.activeRoute,
    refreshing: state.areas.refreshing,
    pristine: state.app.pristineCacheTooltip,
    hasSeenWelcomeScreen: hasSeenLatestWhatsNewOrWelcomeScreen(state),
    needsUpdate: areasOutdated && !appSyncing && isConnected && loggedIn
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
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
