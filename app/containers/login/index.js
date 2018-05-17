// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLoginAuth, googleLogin, facebookLogin, logout } from 'redux-modules/user';
import Login from 'components/login';

function mapStateToProps(state: State) {
  return {
    isConnected: state.offline.online,
    loggedIn: state.user.loggedIn,
    logSuccess: state.user.logSuccess,
    loading: state.user.loading,
    version: state.app.version
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  logout,
  googleLogin,
  facebookLogin,
  setLoginAuth
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
