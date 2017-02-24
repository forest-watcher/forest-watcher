import { connect } from 'react-redux';
import { getUser, setLoginModal, setLoginStatus, checkLogged } from 'redux-modules/user';
import { NavigationActions } from 'react-navigation';
import Home from 'components/home';

function mapStateToProps(state) {
  return {
    loggedIn: state.user.loggedIn
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    getUser: () => {
      dispatch(getUser());
    },
    navigateReset: (routeName) => {
      const action = NavigationActions.reset({
        index: 0,
        actions: [{
          type: 'Navigate',
          routeName,
          params: {
            goBackDisabled: true
          }
        }]
      });
      navigation.dispatch(action);
    },
    setLoginModal: (status) => {
      dispatch(setLoginModal(status));
    },
    setLoginStatus: (status) => {
      dispatch(setLoginStatus(status));
    },
    checkLogged: () => {
      dispatch(checkLogged());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
