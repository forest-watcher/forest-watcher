import { connect } from 'react-redux';
import { setLoginStatus, loginGoogle, logout } from 'redux-modules/user';
import Login from 'components/login';

function mapStateToProps(state) {
  return {
    isConnected: state.offline.online,
    loggedIn: state.user.loggedIn,
    logoutSuccess: state.user.logoutSuccess
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setLoginStatus: (action) => {
      dispatch(setLoginStatus(action));
    },
    loginGoogle: () => dispatch(loginGoogle()),
    logout: () => dispatch(logout())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
