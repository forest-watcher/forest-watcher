import { connect } from 'react-redux';
import { setLoginModal, setLoginStatus } from 'redux-modules/user';
import Login from 'components/login';

function mapStateToProps(state) {
  return {
    loginModal: state.user.loginModal,
    userToken: state.user.token,
    isConnected: state.app.isConnected
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setLoginModal: (action) => {
      dispatch(setLoginModal(action));
    },
    setLoginStatus: (action) => {
      dispatch(setLoginStatus(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
