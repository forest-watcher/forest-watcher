// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setSetupCountry } from 'redux-modules/setup';

import SetupCountry from 'components/setup/country';

function mapStateToProps(state: State) {
  return {
    user: !state.user.data ? ' ' : state.user.data,
    setupCountry: state.setup.country,
    countries: state.countries.data
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  setSetupCountry
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupCountry);
