// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Dashboard from 'components/dashboard';
import {
  updateApp,
  setPristineCacheTooltip,
  showNotConnectedNotification,
  setWelcomeScreenSeen
} from 'redux-modules/app';
import { createReport } from 'redux-modules/reports';
import { setAreasRefreshing, setSelectedAreaId } from 'redux-modules/areas';
import { isOutdated } from 'helpers/date';
import { shouldBeConnected } from 'helpers/app';

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
    hasSeenWelcomeScreen: state.app.hasSeenWelcomeScreen,
    needsUpdate: areasOutdated && !appSyncing && isConnected && loggedIn
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators(
    {
      updateApp,
      createReport,
      setAreasRefreshing,
      setSelectedAreaId,
      showNotConnectedNotification,
      setPristine: setPristineCacheTooltip,
      setWelcomeScreenSeen
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
