// @flow
import { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Dashboard from 'components/dashboard';
import { setPristineCacheTooltip } from 'redux-modules/app';
import { createReport } from 'redux-modules/reports';
import { isOutdated } from 'helpers/date';
import { getAreas, setAreasRefreshing, updateSelectedIndex } from 'redux-modules/areas';
import withSuccessNotification from 'components/toast-notification/with-success-notification';

function mapStateToProps(state: State) {
  return {
    refreshing: state.areas.refreshing,
    areasOutdated: isOutdated(state.areas.syncDate),
    areasSyncing: state.areas.syncing,
    pristine: state.app.pristineCacheTooltip
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators({
    getAreas,
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
