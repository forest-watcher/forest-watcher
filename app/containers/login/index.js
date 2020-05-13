// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLoginAuth, googleLogin, facebookLogin, logout } from 'redux-modules/user';
import Login from 'components/login';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    loggedIn: state.user.loggedIn,
    logSuccess: state.user.logSuccess,
    loading: state.user.loading,
    version: state.app.version
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      logout,
      googleLogin,
      facebookLogin,
      setLoginAuth
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Login);
