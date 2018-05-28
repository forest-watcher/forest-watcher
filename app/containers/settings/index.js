// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isUnsafeLogout } from 'helpers/app';
import { logout } from 'redux-modules/user';
import { setOfflineMode } from 'redux-modules/app';

import Settings from 'components/settings';

function mapStateToProps(state: State) {
  return {
    version: state.app.version,
    isUnsafeLogout: isUnsafeLogout(state),
    user: state.user.data,
    loggedIn: state.user.loggedIn,
    areas: state.areas.data,
    isConnected: state.offline.online,
    offlineMode: state.app.offlineMode
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  logout,
  setOfflineMode
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
