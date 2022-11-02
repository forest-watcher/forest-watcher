// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import { Teams } from 'components/teams';

import { connect } from 'react-redux';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State, props: OwnProps) {
  return {
    teams: state.teams.data,
    invites: state.teams.invites,
    areas: state.areas.data
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {};
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default (connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Teams): Class<any> & ((props: any) => React$Element<any>));
