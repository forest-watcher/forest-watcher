// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Dashboard from 'components/dashboard';
import { updateApp, setPristineCacheTooltip } from 'redux-modules/app';
import { createReport } from 'redux-modules/reports';
import { isOutdated } from 'helpers/date';
import { setAreasRefreshing, updateSelectedIndex } from 'redux-modules/areas';
import withSuccessNotification from 'components/toast-notification/with-notifications';

function mapStateToProps(state: State) {
  return {
    refreshing: state.areas.refreshing,
    isConnected: state.offline.online,
    areasOutdated: isOutdated(state.areas.syncDate),
    appSyncing: (state.areas.syncing || state.layers.syncing || state.alerts.queue.length > 0),
    pristine: state.app.pristineCacheTooltip
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators({
    updateApp,
    createReport,
    setAreasRefreshing,
    setPristine: setPristineCacheTooltip,
    updateSelectedIndex
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withSuccessNotification(Dashboard));
