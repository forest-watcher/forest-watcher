import { connect } from 'react-redux';
import { navigatePush, navigatePop, toggleHeader } from 'redux-modules/navigation';
import { setLoginModal, setLoginStatus } from 'redux-modules/user';
import Login from 'components/login';

function mapStateToProps(state) {
  return {
    loginModal: state.user.loginModal
  };
}

function mapDispatchToProps(dispatch) {
  return {
    navigate: (action) => {
      dispatch(navigatePush(action));
    },
    navigateBack: (action) => {
      dispatch(navigatePop(action));
    },
    onToggleHeader: (action) => {
      dispatch(toggleHeader(action));
    },
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
