// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isUnsafeLogout } from 'helpers/app';
import { logout } from 'redux-modules/user';
import { setOfflineMode } from 'redux-modules/app';

import Settings from 'components/settings';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    version: state.app.version,
    isUnsafeLogout: isUnsafeLogout(state),
    user: state.user.data,
    loggedIn: state.user.loggedIn,
    offlineMode: state.app.offlineMode
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      logout,
      setOfflineMode
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
