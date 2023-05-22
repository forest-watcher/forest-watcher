// @flow
import type { LoginProvider } from 'types/app.types';
import type { Dispatch, GetState, Thunk } from 'types/store.types';
import type { UserState, UserAction } from 'types/user.types';

import { PERSIST_REHYDRATE, RESET_STATE } from '@redux-offline/redux-offline/lib/constants';
import { authorize, revoke } from 'react-native-app-auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import Config from 'react-native-config';
import oAuth from 'config/oAuth';
import i18n from 'i18next';
import jwt_decode from 'jwt-decode';

import { appleAuth } from '@invertase/react-native-apple-authentication';

import { deleteAllOfflinePacks } from 'helpers/mapbox';
import { decreaseAppSynced } from './app';

// Actions
const GET_USER_REQUEST = 'user/GET_USER_REQUEST';
const GET_USER_COMMIT = 'user/GET_USER_COMMIT';
const GET_USER_ROLLBACK = 'user/GET_USER_ROLLBACK';
const SET_LOGIN_AUTH = 'user/SET_LOGIN_AUTH';
const SET_LOGIN_STATUS = 'user/SET_LOGIN_STATUS';
export const LOGOUT_REQUEST = 'user/LOGOUT_REQUEST';
const SET_LOGIN_LOADING = 'user/SET_LOGIN_LOADING';
const SET_EMAIL_LOGIN_ERROR = 'user/SET_EMAIL_LOGIN_ERROR';
const CLEAR_EMAIL_LOGIN_ERROR = 'user/CLEAR_EMAIL_LOGIN_ERROR';

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
  loading: false,
  emailLoginError: null,
  deleted: false
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
      const userId = parseJwt(token).id;
      return { ...state, socialNetwork, loggedIn, token, oAuthToken, userId, emailLoginError: null };
    }
    case SET_LOGIN_STATUS: {
      const logSuccess = action.payload;
      return { ...state, logSuccess };
    }
    case SET_LOGIN_LOADING: {
      const loading = action.payload;
      return { ...state, loading };
    }
    case SET_EMAIL_LOGIN_ERROR: {
      const error = action.payload;
      return { ...state, emailLoginError: error };
    }
    case CLEAR_EMAIL_LOGIN_ERROR: {
      return { ...state, emailLoginError: null, loading: false };
    }
    case LOGOUT_REQUEST:
      return {
        ...state,
        token: null,
        synced: false,
        loggedIn: false,
        oAuthToken: null,
        socialNetwork: null,
        userId: null,
        deleted: false
      };
    default:
      return state;
  }
}

function parseJwt(token) {
  const decoded = jwt_decode(token);
  return decoded;
}

// Action Creators
export function getUser(): UserAction {
  return {
    type: GET_USER_REQUEST,
    meta: {
      offline: {
        effect: { url: `${Config.API_AUTH}/user` },
        commit: {
          type: GET_USER_COMMIT,
          meta: {
            then: payload => (dispatch, state) => {
              dispatch(decreaseAppSynced());
            }
          }
        },
        rollback: { type: GET_USER_ROLLBACK }
      }
    }
  };
}

export function syncUser() {
  return (dispatch: Dispatch, state: GetState) => {
    const { user } = state();
    if (!user.synced && !user.syncing) {
      dispatch(getUser());
    }
  };
}

export function appleLogin() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch({ type: SET_LOGIN_LOADING, payload: true });
      const result = await appleAuth.performRequest(oAuth.apple);
      const { identityToken, user } = result;
      const credentialState = await appleAuth.getCredentialStateForUser(user);
      if (credentialState !== appleAuth.State.AUTHORIZED) {
        dispatch({ type: SET_LOGIN_STATUS, payload: false });
        dispatch({ type: SET_LOGIN_LOADING, payload: false });
        return;
      }
      try {
        const response = await fetch(`${Config.API_AUTH}/auth/apple/token?access_token=${identityToken}`);
        dispatch({ type: SET_LOGIN_LOADING, payload: false });
        if (!response.ok) {
          throw new Error(response.status);
        }
        const data = await response.json();
        dispatch({
          type: SET_LOGIN_AUTH,
          payload: {
            socialNetwork: 'apple',
            loggedIn: true,
            token: data.token,
            oAuthToken: identityToken,
            userId: user
          }
        });
      } catch (e) {
        console.error(e);
        dispatch({ type: SET_LOGIN_LOADING, payload: false });
        dispatch(logout('apple'));
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: SET_LOGIN_STATUS, payload: false });
      dispatch({ type: SET_LOGIN_LOADING, payload: false });
    }
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
        if (!response.ok) {
          throw new Error(response.status);
        }
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
      const userDismissedLogin =
        e.message.includes('error -3') ||
        e.message.includes('Failed to authenticate') ||
        e.message.includes('User cancelled flow');
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
          const user: ?AccessToken = await AccessToken.getCurrentAccessToken();

          if (!user) {
            throw new Error('No user returned by RNFBSDK');
          }

          const response = await fetch(`${Config.API_AUTH}/auth/facebook/token?access_token=${user.accessToken}`);
          dispatch({ type: SET_LOGIN_LOADING, payload: false });
          if (!response.ok) {
            throw new Error(response.status);
          }
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

export function emailLogin(email: string, password: string): Thunk<Promise<void>> {
  return async (dispatch: Dispatch) => {
    try {
      dispatch({ type: SET_LOGIN_LOADING, payload: true });
      dispatch({ type: CLEAR_EMAIL_LOGIN_ERROR });
      const url = `${Config.API_AUTH}/auth/login`;
      const fetchConfig = {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ email, password })
      };
      const response = await fetch(url, fetchConfig);
      if (!(response?.ok && response?.status === 200)) {
        const responseJson = await response.json();
        const errorMessage = responseJson?.errors?.[0]?.detail ?? i18n.t('login.emailLogin.loginError');
        console.warn('3SC', 'API Error logging in using email: ', errorMessage);
        dispatch({
          type: SET_EMAIL_LOGIN_ERROR,
          payload: errorMessage
        });
        return;
      }
      const responseJson = await response.json();
      dispatch({
        type: SET_LOGIN_AUTH,
        payload: {
          loggedIn: true,
          socialNetwork: 'email',
          token: responseJson.data.token,
          userId: responseJson.data.id
        }
      });
    } catch (error) {
      console.warn('3SC', 'Error trying to log in using email: ', error);
      dispatch({ type: SET_LOGIN_STATUS, payload: false });
      dispatch({ type: SET_EMAIL_LOGIN_ERROR, payload: error.toString() });
    } finally {
      dispatch({ type: SET_LOGIN_LOADING, payload: false });
    }
  };
}

export function clearEmailLoginError(): UserAction {
  return { type: CLEAR_EMAIL_LOGIN_ERROR };
}

export function setLoginAuth(details: { token: string, loggedIn: boolean, socialNetwork: LoginProvider }): UserAction {
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

export function logout(socialNetworkFallback: ?string): Thunk<Promise<void>> {
  return async (dispatch: Dispatch, state: GetState) => {
    const { oAuthToken: tokenToRevoke, socialNetwork } = state().user;
    dispatch({ type: LOGOUT_REQUEST });
    dispatch({ type: RESET_STATE });

    try {
      await deleteAllOfflinePacks();

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
      dispatch({ type: SET_LOGIN_STATUS, payload: true });
    } catch (e) {
      console.error(e);
      dispatch({ type: SET_LOGIN_STATUS, payload: false });
    }
  };
}
