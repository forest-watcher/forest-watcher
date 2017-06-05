import { connect } from 'react-redux';
import { getAreas, getAreaCoverage } from 'redux-modules/areas';
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
    getAreas: () => {
      dispatch(getAreas());
    },
    getAreaCoverage: (areaId) => {
      dispatch(getAreaCoverage(areaId));
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
