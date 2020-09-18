// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setSetupCountry } from 'redux-modules/setup';
import { logout } from 'redux-modules/user';

import { setAreaCountryTooltipSeen, setWelcomeScreenSeen } from 'redux-modules/app';

import SetupCountry from 'components/setup/country';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    areaCountryTooltipSeen: state.app.areaCountryTooltipSeen,
    user: !state.user.data ? ' ' : state.user.data,
    setupCountry: state.setup.country,
    countries: state.countries.data,
    hasSeenWelcomeScreen: state.app.hasSeenWelcomeScreen
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      logout,
      setAreaCountryTooltipSeen,
      setWelcomeScreenSeen,
      setSetupCountry
    },
    dispatch
  );
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(SetupCountry);
