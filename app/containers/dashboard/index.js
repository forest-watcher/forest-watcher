// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Dashboard from 'components/dashboard';
import { updateApp, setPristineCacheTooltip } from 'redux-modules/app';
import { createReport } from 'redux-modules/reports';
import { isOutdated } from 'helpers/date';
import { setAreasRefreshing, setSelectedAreaId } from 'redux-modules/areas';

function mapStateToProps(state: State) {
  const areasOutdated = !state.areas.synced || isOutdated(state.areas.syncDate);
  const appSyncing = (state.areas.syncing || state.layers.syncing || state.alerts.queue.length > 0);
  const isConnected = state.offline.online;
  const loggedIn = state.user.loggedIn;
  return {
    appSyncing,
    isConnected,
    areasOutdated,
    refreshing: state.areas.refreshing,
    pristine: state.app.pristineCacheTooltip,
    needsUpdate: areasOutdated && !appSyncing && isConnected && loggedIn
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators({
    updateApp,
    createReport,
    setAreasRefreshing,
    setPristine: setPristineCacheTooltip,
    setSelectedAreaId
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
