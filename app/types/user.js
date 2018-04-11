// @flow

import type { OfflineMeta } from 'types/offline';

import {
  GET_USER_REQUEST,
  GET_USER_COMMIT,
  GET_USER_ROLLBACK,
  SET_LOGIN_AUTH,
  SET_LOGIN_STATUS,
  LOGOUT_REQUEST
} from 'redux-modules/user';

export type UserState = {
  data: Object,
  loggedIn: boolean,
  token: ?string,
  oAuthToken: ?string,
  socialNetwork: ?string,
  logSuccess: boolean,
  synced: boolean,
  syncing: boolean
}

export type UserAction = GetUserRequest | GetUserCommit | GetUserRollback | SetLoginAuth | SetLoginStatus | LogoutRequest;

type User = {};

type GetUserRequest = { type: typeof GET_USER_REQUEST, meta: OfflineMeta };
type GetUserCommit = { type: typeof GET_USER_COMMIT, payload: User };
type GetUserRollback = { type: typeof GET_USER_ROLLBACK };

type SetLoginAuth = {
  type: typeof SET_LOGIN_AUTH,
  payload: {
    socialNetwork: string,
    loggedIn: boolean,
    token: string,
    oAuthToken: string
  }
}

type SetLoginStatus = {
  type: typeof SET_LOGIN_STATUS,
  payload: boolean
}

type LogoutRequest = {
  type: typeof LOGOUT_REQUEST
}
