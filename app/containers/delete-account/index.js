//@flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import { logout } from 'redux-modules/user';

import { connect } from 'react-redux';
import { DeleteAccount } from 'components/delete-account';

type OwnProps = {};

function mapStateToProps(state: State, props: OwnProps) {
  return {
    user: state.user,
    teams: state.teams.data
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    logout: () => {
      dispatch(logout());
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default (connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(DeleteAccount): Class<any> & ((props: any) => React$Element<any>));
