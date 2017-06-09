import { connect } from 'react-redux';
import { getAlertsJson } from 'redux-modules/areas';
import { logout } from 'redux-modules/user';

import Settings from 'components/settings';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    areas: state.areas.data
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName, params) => {
      navigation.navigate(routeName, params);
    },
    getAlertsJson: (areaId) => { // TODO: move to sync page
      dispatch(getAlertsJson(areaId));
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
