import { connect } from 'react-redux';
import { setSetupWdpaid } from 'redux-modules/setup';

import SetupBoundaries from 'components/setup/boundaries';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    setupCountry: state.setup.country,
    countries: state.countries.data
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setSetupWdpaid: (area) => {
      dispatch(setSetupWdpaid(area));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupBoundaries);
