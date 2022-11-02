// @flow

import type { TeamActionType, TeamsAction, TeamsState } from '../types/teams.types';
import type { Dispatch, GetState } from 'types/store.types';
import { trackInviteAction } from '../helpers/analytics';
import { decreaseAppSynced } from './app';
import { LOGOUT_REQUEST } from './user';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/src/constants';

import Config from 'react-native-config';
import jwt_decode from 'jwt-decode';

const GET_TEAMS_REQUEST = 'teams/GET_TEAMS_REQUEST';
export const GET_TEAMS_COMMIT = 'teams/GET_TEAMS_COMMIT';
const GET_TEAMS_ROLLBACK = 'teams/GET_TEAMS_ROLLBACK';
const GET_TEAM_INVITES_REQUEST = 'teams/GET_TEAM_INVITES_REQUEST';
const GET_TEAM_INVITES_COMMIT = 'teams/GET_TEAM_INVITES_COMMIT';
const GET_TEAM_INVITES_ROLLBACK = 'teams/GET_TEAM_INVITES_ROLLBACK';
const TEAM_ACTION_REQUEST = 'teams/TEAM_ACTION_REQUEST';
export const TEAM_ACTION_ACCEPT_COMMIT = 'teams/TEAM_ACTION_ACCEPT_COMMIT';
const TEAM_ACTION_ACCEPT_ROLLBACK = 'teams/TEAM_ACTION_ACCEPT_ROLLBACK';
export const TEAM_ACTION_DECLINE_COMMIT = 'teams/TEAM_ACTION_DECLINE_COMMIT';
const TEAM_ACTION_DECLINE_ROLLBACK = 'teams/TEAM_ACTION_DECLINE_ROLLBACK';
export const TEAM_ACTION_LEAVE_COMMIT = 'teams/TEAM_ACTION_LEAVE_COMMIT';
const TEAM_ACTION_LEAVE_ROLLBACK = 'teams/TEAM_ACTION_LEAVE_ROLLBACK';

const initialState: TeamsState = {
  data: [],
  invites: [],
  synced: false,
  syncing: false,
  refreshing: false,
  syncError: false,
  syncDate: Date.now()
};

export default function reducer(state: TeamsState = initialState, action: TeamsAction): TeamsState {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      return {
        ...state,
        ...action.payload.teams
      };
    }
    case GET_TEAMS_REQUEST: {
      return { ...state, synced: false, syncing: true };
    }
    case GET_TEAMS_COMMIT: {
      const syncData = {
        syncDate: Date.now(),
        synced: true,
        syncing: false,
        syncError: false,
        refreshing: false
      };
      return { ...state, data: action.payload, ...syncData };
    }
    case GET_TEAMS_ROLLBACK: {
      return { ...state, syncing: false, syncError: true };
    }
    case GET_TEAM_INVITES_REQUEST: {
      return { ...state, syncing: true };
    }
    case GET_TEAM_INVITES_COMMIT: {
      return { ...state, invites: action.payload, syncing: false };
    }
    case GET_TEAM_INVITES_ROLLBACK: {
      return { ...state, syncing: false, syncError: true };
    }
    case TEAM_ACTION_REQUEST: {
      return { ...state, syncing: true };
    }
    case TEAM_ACTION_ACCEPT_COMMIT: {
      trackInviteAction('accept');
      const teams = state.data;
      let invites = state.invites;
      const foundTeam = invites.find(x => x.id === action.payload.teamId);
      if (foundTeam) {
        teams.push(foundTeam);
      }
      invites = invites.filter(item => item.id !== action.payload.teamId);
      return { ...state, syncing: false, data: teams, invites };
    }
    case TEAM_ACTION_ACCEPT_ROLLBACK: {
      return { ...state, syncing: false, syncError: true };
    }
    case TEAM_ACTION_DECLINE_COMMIT: {
      trackInviteAction('decline');
      let invites = state.invites;
      invites = invites.filter(item => item.id !== action.payload.teamId);
      return { ...state, syncing: false, invites };
    }
    case TEAM_ACTION_DECLINE_ROLLBACK: {
      return { ...state, syncing: false, syncError: true };
    }
    case TEAM_ACTION_LEAVE_COMMIT: {
      let teams = state.data;
      teams = teams.filter(item => item.id !== action.payload.teamId);
      return { ...state, syncing: false, data: teams };
    }
    case TEAM_ACTION_LEAVE_ROLLBACK: {
      return { ...state, syncing: false, syncError: true };
    }
    case LOGOUT_REQUEST: {
      return initialState;
    }
    default: {
      return state;
    }
  }
}

const ACTION_TYPES = {
  accept: {
    commit: TEAM_ACTION_ACCEPT_COMMIT,
    rollback: TEAM_ACTION_ACCEPT_ROLLBACK
  },
  decline: {
    commit: TEAM_ACTION_DECLINE_COMMIT,
    rollback: TEAM_ACTION_DECLINE_ROLLBACK
  },
  leave: {
    commit: TEAM_ACTION_LEAVE_COMMIT,
    rollback: TEAM_ACTION_LEAVE_ROLLBACK
  }
};

export function performTeamAction(
  teamId: string,
  action: TeamActionType
): (dispatch: Dispatch, state: GetState) => void {
  return (dispatch: Dispatch, state: GetState) => {
    let userId = state().user.userId;
    const syncing = state().teams.syncing;
    /* For migration - previous versions didn't store the user id */
    if (!userId) {
      const token = state().user.token;
      const decoded = jwt_decode(token);
      userId = decoded.id;
    }
    const url = `${Config.API_V3_URL}/teams/${teamId}/users/${userId}/${action}`;
    if (!syncing) {
      dispatch({
        type: TEAM_ACTION_REQUEST,
        meta: {
          offline: {
            effect: { url, method: 'PATCH' },
            commit: { type: ACTION_TYPES[action].commit },
            rollback: { type: ACTION_TYPES[action].rollback }
          }
        }
      });
    }
  };
}

export function getTeams(userId: string): TeamsAction {
  const url = `${Config.API_V3_URL}/teams/user/${userId}`;
  return {
    type: GET_TEAMS_REQUEST,
    meta: {
      offline: {
        effect: { url },
        commit: {
          type: GET_TEAMS_COMMIT,
          meta: {
            then: payload => (dispatch, state) => {
              dispatch(getTeamInvites());
              dispatch(decreaseAppSynced());
            }
          }
        },
        rollback: { type: GET_TEAMS_ROLLBACK }
      }
    }
  };
}

export function getTeamInvites(): (dispatch: Dispatch, state: GetState) => void {
  return (dispatch: Dispatch, state: GetState) => {
    const url = `${Config.API_V3_URL}/teams/myinvites`;
    const syncing = state().teams.syncing;
    if (!syncing) {
      dispatch({
        type: GET_TEAM_INVITES_REQUEST,
        meta: {
          offline: {
            effect: { url },
            commit: { type: GET_TEAM_INVITES_COMMIT },
            rollback: { type: GET_TEAM_INVITES_ROLLBACK }
          }
        }
      });
    }
  };
}

export function syncTeams(): (dispatch: Dispatch, state: GetState) => void {
  return (dispatch: Dispatch, state: GetState) => {
    const { loggedIn } = state().user;
    let userId = state().user.userId;
    /* For migration - previous versions didn't store the user id */
    if (!userId) {
      const token = state().user.token;
      const decoded = jwt_decode(token);
      userId = decoded.id;
    }
    const { syncing } = state().teams;
    if (!syncing && loggedIn && userId != null) {
      dispatch(getTeams(userId));
    }
  };
}
