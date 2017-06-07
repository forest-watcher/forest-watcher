import { connect } from 'react-redux';
import { syncApp } from 'redux-modules/app';
import { getLanguage } from 'helpers/language';
import { getReadyState, getActionsPending } from 'helpers/sync';

import Sync from 'components/sync';

function mapStateToProps(state) {
  const actionsPending = getActionsPending(state);
  return {
    isConnected: state.offline.online,
    reach: state.offline.netInfo && state.offline.netInfo.reach,
    languageChanged: state.app.language !== getLanguage(),
    readyState: getReadyState(state) && actionsPending === 0,
    actionsPending
  };
}

function mapDispatchToProps(dispatch) {
  return {
    syncApp: () => dispatch(syncApp())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sync);
