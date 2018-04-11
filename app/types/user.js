import type { OfflineMeta } from 'types/offline';

import {
  GET_USER_REQUEST,
  GET_USER_COMMIT,
  GET_USER_ROLLBACK,
  SET_LOGIN_AUTH,
  SET_LOGIN_STATUS,
  LOGOUT_REQUEST
} from 'redux-modules/user';

export type UserAction = GetUserRequest | GetUserCommit | GetUserRollback | SetLoginAuth | SetLoginStatus | LogoutRequest;

type User = {};

type GetUserRequest = { type: GET_USER_REQUEST, meta: OfflineMeta };
type GetUserCommit = { type: GET_USER_COMMIT, payload: User };
type GetUserRollback = { type: GET_USER_ROLLBACK };

type SetLoginAuth = {
  type: SET_LOGIN_AUTH,
  payload: {
    socialNetwork: string,
    loggedIn: boolean,
    token: string,
    oAuthToken: string
  }
}

type SetLoginStatus = {
  type: SET_LOGIN_STATUS,
  payload: boolean
}

type LogoutRequest = {
  type: LOGOUT_REQUEST
}
