import { connect } from 'react-redux';
import { syncApp, setSyncModal } from 'redux-modules/app';
import { getLanguage } from 'helpers/language';
import { getReadyState, getTotalActionsPending } from 'helpers/sync';

import Sync from 'components/sync';

function mapStateToProps(state) {
  const actionsPending = getTotalActionsPending(state);
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
    syncApp: () => dispatch(syncApp()),
    setSyncModal: open => dispatch(setSyncModal(open))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sync);
