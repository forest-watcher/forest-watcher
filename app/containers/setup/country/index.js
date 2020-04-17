// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setSetupCountry } from 'redux-modules/setup';
import { logout } from 'redux-modules/user';

import { setAreaCountryTooltipSeen } from 'redux-modules/app';

import SetupCountry from 'components/setup/country';

function mapStateToProps(state: State) {
  return {
    areaCountryTooltipSeen: state.app.areaCountryTooltipSeen,
    user: !state.user.data ? ' ' : state.user.data,
    setupCountry: state.setup.country,
    countries: state.countries.data
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators(
    {
      logout,
      setAreaCountryTooltipSeen,
      setSetupCountry
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupCountry);
