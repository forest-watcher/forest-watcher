import { connect } from 'react-redux';
import { setIsConnected } from 'redux-modules/app';
import { getAreas } from 'redux-modules/areas';
import { getUser, setLoginModal, setLoginStatus, checkLogged } from 'redux-modules/user';
import { NavigationActions } from 'react-navigation';
import Home from 'components/home';

function mapStateToProps(state) {
  return {
    hasAreas: state.areas.data && state.areas.data.length > 0,
    areasSynced: state.areas.synced,
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
    },
    setIsConnected: (isConnected) => {
      dispatch(setIsConnected(isConnected));
    },
    getAreas: () => {
      dispatch(getAreas());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
