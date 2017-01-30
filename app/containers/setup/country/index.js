import { connect } from 'react-redux';
import { navigatePush, navigatePop, showNavHeader } from 'redux-modules/navigation';
import { getUser } from 'redux-modules/user';
import { getCountries } from 'redux-modules/countries';

import SetupCountry from 'components/setup/country';

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
    },
    showNavHeader: (action) => {
      dispatch(showNavHeader(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupCountry);
