// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isUnsafeLogout } from 'helpers/app';
import { logout } from 'redux-modules/user';
import { setOfflineMode, showNotConnectedNotification } from 'redux-modules/app';

import Settings from 'components/settings';

function mapStateToProps(state: State) {
  return {
    version: state.app.version,
    isUnsafeLogout: isUnsafeLogout(state),
    user: state.user.data,
    loggedIn: state.user.loggedIn,
    areas: state.areas.data,
    offlineMode: state.app.offlineMode
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      logout,
      setOfflineMode,
      showNotConnectedNotification
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
