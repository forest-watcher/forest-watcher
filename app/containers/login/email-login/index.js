// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { clearEmailLoginError, emailLogin } from 'redux-modules/user';
import EmailLogin from 'components/login/email-login';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    loginError: state.user.emailLoginError,
    loading: state.user.loading
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      emailLogin,
      clearEmailLoginError
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(EmailLogin);
