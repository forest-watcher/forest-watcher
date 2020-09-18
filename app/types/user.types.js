// @flow

import type { LoginProvider } from 'types/app.types';
import type { OfflineMeta, PersistRehydrate } from 'types/offline.types';

export type UserState = {
  data: Object,
  loggedIn: boolean,
  token: ?string,
  oAuthToken: ?string,
  socialNetwork: ?string,
  logSuccess: boolean,
  synced: boolean,
  syncing: boolean,
  loading: boolean,
  emailLoginError: ?string
};

export type UserAction =
  | GetUserRequest
  | GetUserCommit
  | GetUserRollback
  | SetLoginAuth
  | SetLoginStatus
  | SetLoginLoading
  | SetEmailLoginError
  | ClearEmailLoginError
  | PersistRehydrate
  | LogoutRequest;

type User = {};

export type GetUserRequest = { type: 'user/GET_USER_REQUEST', meta: OfflineMeta };
export type GetUserCommit = { type: 'user/GET_USER_COMMIT', payload: User };
export type GetUserRollback = { type: 'user/GET_USER_ROLLBACK' };
export type SetLoginAuth = {
  type: 'user/SET_LOGIN_AUTH',
  payload: {
    socialNetwork: LoginProvider,
    loggedIn: boolean,
    token: string,
    oAuthToken?: string
  }
};
export type SetLoginStatus = {
  type: 'user/SET_LOGIN_STATUS',
  payload: boolean
};
export type LogoutRequest = {
  type: 'user/LOGOUT_REQUEST'
};
export type SetLoginLoading = {
  type: 'user/SET_LOGIN_LOADING',
  payload: boolean
};
export type SetEmailLoginError = {
  type: 'user/SET_EMAIL_LOGIN_ERROR',
  payload: ?string
};
export type ClearEmailLoginError = {
  type: 'user/CLEAR_EMAIL_LOGIN_ERROR'
};
