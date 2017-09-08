import { connect } from 'react-redux';
import { logout } from 'redux-modules/user';

import Settings from 'components/settings';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    loggedIn: state.user.loggedIn,
    areas: state.areas.data,
    isConnected: state.offline.online
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName, params) => {
      navigation.navigate(routeName, params);
    },
    logout: () => {
      dispatch(logout());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
