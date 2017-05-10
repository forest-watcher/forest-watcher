import { connect } from 'react-redux';
import { getAreas, updateDate } from 'redux-modules/areas';
import { logout } from 'redux-modules/user';

import Settings from 'components/settings';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    areas: state.areas.data,
    fromDate: state.areas.fromDate,
    toDate: state.areas.toDate
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
    updateDate: date => dispatch(updateDate(date)),
    logout: () => {
      dispatch(logout());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
