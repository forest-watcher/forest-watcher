// @flow
import type { Dispatch, GetState } from 'types/store.types';
import type { UserState, UserAction } from 'types/user.types';

import { PERSIST_REHYDRATE, RESET_STATE } from '@redux-offline/redux-offline/lib/constants';
import { authorize, revoke } from 'react-native-app-auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import Config from 'react-native-config';
import oAuth from 'config/oAuth';

const CookieManager = require('react-native-cookies');

// Actions
const GET_USER_REQUEST = 'user/GET_USER_REQUEST';
const GET_USER_COMMIT = 'user/GET_USER_COMMIT';
const GET_USER_ROLLBACK = 'user/GET_USER_ROLLBACK';
const SET_LOGIN_AUTH = 'user/SET_LOGIN_AUTH';
const SET_LOGIN_STATUS = 'user/SET_LOGIN_STATUS';
export const LOGOUT_REQUEST = 'user/LOGOUT_REQUEST';
const SET_LOGIN_LOADING = 'user/SET_LOGIN_LOADING';

// Reducer
const initialState = {
  data: {},
  loggedIn: false,
  token: null,
  oAuthToken: null,
  socialNetwork: null,
  logSuccess: true,
  synced: false,
  syncing: false,
  loading: false
};

export default function reducer(state: UserState = initialState, action: UserAction): UserState {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { user } = action.payload;
      return { ...state, ...user, loading: false };
    }
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
    case SET_LOGIN_LOADING: {
      const loading = action.payload;
      return { ...state, loading };
    }
    case LOGOUT_REQUEST:
      return {
        ...state,
        token: null,
        synced: false,
        loggedIn: false,
        oAuthToken: null,
        socialNetwork: null
      };
    default:
      return state;
  }
}

// Action Creators
export function getUser(): UserAction {
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
      dispatch({ type: SET_LOGIN_LOADING, payload: true });
      const user = await authorize(oAuth.google);
      try {
        const response = await fetch(`${Config.API_AUTH}/auth/google/token?access_token=${user.accessToken}`);
        dispatch({ type: SET_LOGIN_LOADING, payload: false });
        if (!response.ok) throw new Error(response.status);
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
        console.error(e);
        dispatch({ type: SET_LOGIN_LOADING, payload: false });
        dispatch(logout('google'));
      }
    } catch (e) {
      // very brittle approach but only way to know currently
      const userDismissedLoginIOS = e.message.indexOf('error -3') !== -1;
      const userDismissedLoginAndroid = e.message.indexOf('Failed to authenticate') !== -1;
      const userDismissedLogin = userDismissedLoginAndroid || userDismissedLoginIOS;
      if (!userDismissedLogin) {
        console.error(e);
      }
      dispatch({
        type: SET_LOGIN_STATUS,
        payload: userDismissedLogin
      });
      dispatch({ type: SET_LOGIN_LOADING, payload: false });
    }
  };
}

export function facebookLogin() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch({ type: SET_LOGIN_LOADING, payload: true });
      const result = await LoginManager.logInWithPermissions(oAuth.facebook);
      if (!result.isCancelled) {
        try {
          const user = await AccessToken.getCurrentAccessToken();
          const response = await fetch(`${Config.API_AUTH}/auth/facebook/token?access_token=${user.accessToken}`);
          dispatch({ type: SET_LOGIN_LOADING, payload: false });
          if (!response.ok) throw new Error(response.status);
          const data = await response.json();
          dispatch({
            type: SET_LOGIN_AUTH,
            payload: {
              loggedIn: true,
              socialNetwork: 'facebook',
              oAuthToken: user.accessToken,
              token: data.token
            }
          });
        } catch (e) {
          console.error(e);
          dispatch({ type: SET_LOGIN_LOADING, payload: false });
          dispatch(logout('facebook'));
        }
      } else {
        dispatch({ type: SET_LOGIN_LOADING, payload: false });
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: SET_LOGIN_STATUS, payload: false });
      dispatch({ type: SET_LOGIN_LOADING, payload: false });
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

export function logout(socialNetworkFallback: string) {
  return async (dispatch: Dispatch, state: GetState) => {
    const { oAuthToken: tokenToRevoke, socialNetwork } = state().user;
    dispatch({ type: LOGOUT_REQUEST });
    dispatch({ type: RESET_STATE });

    try {
      await CookieManager.clearAll();

      const social = socialNetwork || socialNetworkFallback;
      switch (social) {
        case 'google': {
          if (tokenToRevoke) {
            await revoke(oAuth.google, { tokenToRevoke });
          }
          break;
        }
        case 'facebook':
          await LoginManager.logOut();
          break;
        default:
          break;
      }
      return dispatch({ type: SET_LOGIN_STATUS, payload: true });
    } catch (e) {
      console.error(e);
      return dispatch({ type: SET_LOGIN_STATUS, payload: false });
    }
  };
}
