// @flow
import type { Dispatch, GetState } from 'types/store.types';
import type { UserState, UserAction } from 'types/user.types';

import { RESET_STATE } from '@redux-offline/redux-offline/lib/constants';
import { authorize, revoke } from 'react-native-app-auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import Config from 'react-native-config';
import oAuth from 'config/oAuth';

const CookieManager = require('react-native-cookies');

// Actions
export const GET_USER_REQUEST = 'user/GET_USER_REQUEST';
export const GET_USER_COMMIT = 'user/GET_USER_COMMIT';
export const GET_USER_ROLLBACK = 'user/GET_USER_ROLLBACK';
export const SET_LOGIN_AUTH = 'user/SET_LOGIN_AUTH';
export const SET_LOGIN_STATUS = 'user/SET_LOGIN_STATUS';
export const LOGOUT_REQUEST = 'user/LOGOUT_REQUEST';

// Reducer
const initialState = {
  data: {},
  loggedIn: false,
  token: null,
  oAuthToken: null,
  socialNetwork: null,
  logSuccess: true,
  synced: false,
  syncing: false
};

export default function reducer(state: UserState = initialState, action: UserAction): UserState {
  switch (action.type) {
    case GET_USER_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_USER_COMMIT: {
      const user = action.payload;
      return { ...state, data: user, synced: true, syncing: false };
    }
    case GET_USER_ROLLBACK: {
      return { ...state, syncing: false };
    }
    case SET_LOGIN_AUTH: {
      const { socialNetwork, loggedIn, token, oAuthToken } = action.payload;
      return { ...state, socialNetwork, loggedIn, token, oAuthToken };
    }
    case SET_LOGIN_STATUS: {
      const logSuccess = action.payload;
      return { ...state, logSuccess };
    }
    case LOGOUT_REQUEST:
      return { ...state, token: null, loggedIn: false };
    default:
      return state;
  }
}

// Action Creators
function getUser(): UserAction {
  return {
    type: GET_USER_REQUEST,
    meta: {
      offline: {
        effect: { url: `${Config.API_AUTH}/user` },
        commit: { type: GET_USER_COMMIT },
        rollback: { type: GET_USER_ROLLBACK }
      }
    }
  };
}

export function syncUser() {
  return (dispatch: Dispatch, state: GetState) => {
    const { user } = state();
    if (!user.synced && !user.syncing) dispatch(getUser());
  };
}

export function googleLogin() {
  return async (dispatch: Dispatch) => {
    try {
      const user = await authorize(oAuth.google);
      try {
        const response = await fetch(`${Config.API_AUTH}/auth/google/token?access_token=${user.accessToken}`);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        dispatch({
          type: SET_LOGIN_AUTH,
          payload: {
            socialNetwork: 'google',
            loggedIn: true,
            token: data.token,
            oAuthToken: user.accessToken
          }
        });
      } catch (e) {
        dispatch(logout());
      }
    } catch (e) {
      // very brittle approach but only way to know currently
      const userDismissedLogin = e.message.indexOf('error -4') !== -1;
      dispatch({
        type: SET_LOGIN_STATUS,
        payload: userDismissedLogin
      });
    }
  };
}

export function facebookLogin() {
  return async (dispatch: Dispatch) => {
    try {
      const result = await LoginManager.logInWithReadPermissions(oAuth.facebook);
      if (!result.isCancelled) {
        try {
          const data = await AccessToken.getCurrentAccessToken();
          console.warn(data.accessToken);
          // TODO: implement GFW API login here when available
          dispatch({
            type: SET_LOGIN_AUTH,
            payload: {
              loggedIn: true,
              socialNetwork: 'facebook',
              oAuthToken: data.accessToken,
              token: 'no token' // for now
            }
          });
        } catch (e) {
          dispatch(logout());
        }
      }
    } catch (e) {
      dispatch({ type: SET_LOGIN_STATUS, payload: false });
    }
  };
}

export function setLoginAuth(details: { token: string, loggedIn: boolean, socialNetwork: string }): UserAction {
  const { token, loggedIn, socialNetwork } = details;
  return {
    type: SET_LOGIN_AUTH,
    payload: {
      token,
      loggedIn,
      socialNetwork
    }
  };
}

export function logout() {
  return async (dispatch: Dispatch, state: GetState) => {
    dispatch({ type: RESET_STATE });
    await CookieManager.clearAll();
    dispatch({ type: LOGOUT_REQUEST });
    const { oAuthToken: tokenToRevoke, socialNetwork } = state().user;
    try {
      switch (socialNetwork) {
        case 'google':
          await revoke(oAuth.google, { tokenToRevoke });
          break;
        case 'facebook':
          await LoginManager.logOut();
          break;
        default: break;
      }
    } catch (e) {
      dispatch({ type: SET_LOGIN_STATUS, payload: false });
    }
    return dispatch({ type: SET_LOGIN_STATUS, payload: true });
  };
}
