import { connect } from 'react-redux';
import { isUnsafeLogout } from 'helpers/user';
import { logout } from 'redux-modules/user';

import Settings from 'components/settings';

function mapStateToProps(state) {
  return {
    isUnsafeLogout: isUnsafeLogout(state),
    user: state.user.data,
    loggedIn: state.user.loggedIn,
    areas: state.areas.data,
    isConnected: state.offline.online
  };
}

function mapDispatchToProps(dispatch) {
  return {
    logout: () => {
      dispatch(logout());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
