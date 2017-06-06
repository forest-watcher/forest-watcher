import { connect } from 'react-redux';
import { syncApp } from 'redux-modules/app';
import { getLanguage } from 'helpers/language';
import { getReadyState } from 'helpers/sync';

import Sync from 'components/sync';

function mapStateToProps(state) {
  return {
    isConnected: state.offline.online,
    reach: state.app.netInfo.reach,
    languageChanged: state.app.language !== getLanguage(),
    readyState: getReadyState(state)
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
