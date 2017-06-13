import { connect } from 'react-redux';
import { setSetupCountry } from 'redux-modules/setup';

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
    setSetupCountry: (country) => {
      dispatch(setSetupCountry(country));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupCountry);
