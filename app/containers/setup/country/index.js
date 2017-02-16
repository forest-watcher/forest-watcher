import { connect } from 'react-redux';
import { getUser } from 'redux-modules/user';
import { setSetupCountry } from 'redux-modules/setup';
import { getCountries } from 'redux-modules/countries';

import SetupCountry from 'components/setup/country';

function mapStateToProps(state) {
  return {
    user: !state.user.data ? ' ' : state.user.data,
    setupCountry: state.setup.country,
    countries: state.countries.data
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getUser: () => {
      dispatch(getUser());
    },
    getCountries: () => {
      dispatch(getCountries());
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
