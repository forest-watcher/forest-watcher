import { connect } from 'react-redux';
import { setSetupCountry } from 'redux-modules/setup';
import { getCountries, setLanguage } from 'redux-modules/countries';

import SetupCountry from 'components/setup/country';

function mapStateToProps(state) {
  return {
    user: !state.user.data ? ' ' : state.user.data,
    setupCountry: state.setup.country,
    countries: state.countries.data,
    language: state.countries.language
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getCountries: () => {
      dispatch(getCountries());
    },
    setSetupCountry: (country) => {
      dispatch(setSetupCountry(country));
    },
    setLanguage: (language) => {
      dispatch(setLanguage(language));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupCountry);
