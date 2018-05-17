// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isUnsafeLogout } from 'helpers/user';
import { logout } from 'redux-modules/user';

import Settings from 'components/settings';

function mapStateToProps(state: State) {
  return {
    version: state.app.version,
    isUnsafeLogout: isUnsafeLogout(state),
    user: state.user.data,
    loggedIn: state.user.loggedIn,
    areas: state.areas.data,
    isConnected: state.offline.online
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({ logout }, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
