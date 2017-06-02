import { connect } from 'react-redux';
import { setLoginStatus, loginGoogle } from 'redux-modules/user';
import Login from 'components/login';

function mapStateToProps(state) {
  return {
    isConnected: state.offline.online,
    loggedIn: state.user.loggedIn
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setLoginStatus: (action) => {
      dispatch(setLoginStatus(action));
    },
    loginGoogle: () => dispatch(loginGoogle())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
