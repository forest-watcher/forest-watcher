import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { initSetup } from 'redux-modules/setup';
import { setShowLegend } from 'redux-modules/layers';
import { logout } from 'redux-modules/user';

import Setup from 'components/setup';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    countries: state.countries.data
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    initSetup,
    logout,
    setShowLegend
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Setup);
