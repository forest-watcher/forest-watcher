import { connect } from 'react-redux';
import { navigatePush, navigatePop } from 'redux-modules/navigation';
import { getUser } from 'redux-modules/user';
import { getCountries } from 'redux-modules/countries';

import Setup from 'components/setup';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    countries: state.countries.data
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
    getUser: (action) => {
      dispatch(getUser(action));
    },
    getCountries: (action) => {
      dispatch(getCountries(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Setup);
