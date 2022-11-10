// @flow

import type { RetrySync } from './app.types';
import type { Layer } from './layers.types';
import type { LogoutRequest } from './user.types';

export type UserRole = 'administrator' | 'manager' | 'monitor' | 'left';
export type TeamActionType = 'leave' | 'accept' | 'decline';

export type TeamMember = {
  id: string,
  email: string,
  name: string,
  role: UserRole,
  status: string
};

export type Team = {
  id: string,
  name: string,
  managers: Array<TeamMember>,
  users: Array<string>,
  sentInvitations: Array<string>,
  areas: Array<string>,
  layers: Array<Layer>,
  confirmedUsers: Array<TeamMember>,
  createdAt: string,
  members: Array<TeamMember>,
  userRole: UserRole
};

export type TeamActionResponse = {
  id: string,
  teamId: string,
  userId: string,
  email: string,
  role: UserRole,
  status: 'confirmed' | 'invited' | 'declined'
};

export type TeamsState = {
  data: Array<Team>,
  invites: Array<Team>,
  synced: boolean,
  syncing: boolean,
  refreshing: boolean,
  syncError: boolean,
  syncDate: number
};

export type TeamsAction =
  | GetTeamsRequest
  | GetTeamsCommit
  | GetTeamsRollback
  | LogoutRequest
  | RetrySync
  | GetTeamInvitesRequest
  | GetTeamInvitesCommit
  | GetTeamInvitesRollback
  | TeamActionRequest
  | TeamActionAcceptCommit
  | TeamActionAcceptRollback
  | TeamActionDeclineCommit
  | TeamActionDeclineRollback
  | TeamActionLeaveCommit
  | TeamActionLeaveRollback;

export type GetTeamsRequest = {
  type: 'teams/GET_TEAMS_REQUEST',
  meta: {
    offline: any
  }
};

export type GetTeamsCommit = {
  type: 'teams/GET_TEAMS_COMMIT',
  payload: Array<Team>
};

export type GetTeamsRollback = {
  type: 'teams/GET_TEAMS_ROLLBACK'
};

export type GetTeamInvitesRequest = {
  type: 'teams/GET_TEAM_INVITES_REQUEST',
  meta: {
    offline: any
  }
};

export type GetTeamInvitesCommit = {
  type: 'teams/GET_TEAM_INVITES_COMMIT',
  payload: Array<Team>
};

export type GetTeamInvitesRollback = {
  type: 'teams/GET_TEAM_INVITES_ROLLBACK'
};

export type TeamActionRequest = {
  type: 'teams/TEAM_ACTION_REQUEST',
  meta: {
    offline: any
  }
};

export type TeamActionAcceptCommit = {
  type: 'teams/TEAM_ACTION_ACCEPT_COMMIT',
  payload: TeamActionResponse
};

export type TeamActionAcceptRollback = {
  type: 'teams/TEAM_ACTION_ACCEPT_ROLLBACK'
};
export type TeamActionDeclineCommit = {
  type: 'teams/TEAM_ACTION_DECLINE_COMMIT',
  payload: TeamActionResponse
};

export type TeamActionDeclineRollback = {
  type: 'teams/TEAM_ACTION_DECLINE_ROLLBACK'
};
export type TeamActionLeaveCommit = {
  type: 'teams/TEAM_ACTION_LEAVE_COMMIT',
  payload: TeamActionResponse
};

export type TeamActionLeaveRollback = {
  type: 'teams/TEAM_ACTION_LEAVE_ROLLBACK'
};
