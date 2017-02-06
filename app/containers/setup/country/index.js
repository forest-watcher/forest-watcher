import { connect } from 'react-redux';
import { navigatePush, navigatePop } from 'redux-modules/navigation';
import { getUser } from 'redux-modules/user';
import { setSetupCountry } from 'redux-modules/setup';
import { getCountries } from 'redux-modules/countries';

import SetupCountry from 'components/setup/country';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    setupCountry: state.setup.country,
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
    setSetupCountry: (country) => {
      dispatch(setSetupCountry(country));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupCountry);
