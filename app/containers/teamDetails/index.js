// @flow
import type { Team, TeamActionType } from 'types/teams.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { TeamDetails } from 'components/teamDetails';

import { connect } from 'react-redux';
import { performTeamAction } from 'redux-modules/teams';
import { updateApp } from 'redux-modules/app';

type OwnProps = {
  componentId: string,
  team: Team,
  invited: boolean
};

function mapStateToProps(state: State, props: OwnProps) {
  return {
    offlineMode: state.app.offlineMode,
    appSyncing: state.app.syncing,
    areas: state.areas.data,
    syncing: state.teams.syncing
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    performTeamAction: (teamId: string, action: TeamActionType) => {
      dispatch(performTeamAction(teamId, action));
    },
    updateApp: () => {
      dispatch(updateApp());
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default (connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(TeamDetails): Class<any> & ((props: any) => React$Element<any>));
