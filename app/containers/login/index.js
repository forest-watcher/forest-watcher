import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLoginStatus, googleLogin, facebookLogin, logout } from 'redux-modules/user';
import Login from 'components/login';

function mapStateToProps(state) {
  return {
    isConnected: state.offline.online,
    loggedIn: state.user.loggedIn,
    logSuccess: state.user.logSuccess
  };
}

const mapDispatchToProps = dispatch => bindActionCreators({
  logout,
  googleLogin,
  facebookLogin,
  setLoginStatus
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
