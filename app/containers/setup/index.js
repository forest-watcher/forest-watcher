// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setShowLegend } from 'redux-modules/layers';
import { logout } from 'redux-modules/user';

import Setup from 'components/setup';

function mapStateToProps(state: State) {
  return {
    user: state.user.data,
    countries: state.countries.data
  };
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators({
    logout,
    setShowLegend
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Setup);
