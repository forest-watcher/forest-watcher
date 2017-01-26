import { connect } from 'react-redux';
import { navigatePush, navigatePop } from 'redux-modules/navigation';
import { setLoginModal, setLoginStatus } from 'redux-modules/user';
import App from 'components/app';

function mapStateToProps(state) {
  return {
    navigationRoute: state.navigation,
    loggedIn: state.user.loggedIn
  };
}

function mapDispatchToProps(dispatch) {
  return {
    navigate: (action) => {
      dispatch(navigatePush(action));
    },
    navigateBack: () => {
      dispatch(navigatePop());
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
)(App);
