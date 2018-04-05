import { RESET_STATE } from '@redux-offline/redux-offline/lib/constants';
import { authorize, revoke } from 'react-native-app-auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import Config from 'react-native-config';
import oAuth from 'config/oAuth';

const CookieManager = require('react-native-cookies');

// Actions
const GET_USER_REQUEST = 'user/GET_USER_REQUEST';
const GET_USER_COMMIT = 'user/GET_USER_COMMIT';
const GET_USER_ROLLBACK = 'user/GET_USER_ROLLBACK';
const SET_LOGIN_STATUS = 'user/SET_LOGIN_STATUS';
export const LOGOUT_REQUEST = 'user/LOGOUT_REQUEST';
const LOGOUT_COMMIT = 'user/LOGOUT_COMMIT';
const LOGOUT_ROLLBACK = 'user/LOGOUT_ROLLBACK';

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

export default function reducer(state = initialState, action) {
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
    case SET_LOGIN_STATUS:
      return Object.assign({}, state, { ...action.payload });
    case LOGOUT_REQUEST:
      return { ...state, token: null, loggedIn: false };
    case LOGOUT_COMMIT:
      return { ...initialState, logSuccess: true };
    case LOGOUT_ROLLBACK:
      return { ...state, logSuccess: false };
    default:
      return state;
  }
}

// Action Creators
function getUser() {
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
  return (dispatch, state) => {
    const { user } = state();
    if (!user.synced && !user.syncing) dispatch(getUser());
  };
}

export function setLoginStatus(status) {
  return {
    type: SET_LOGIN_STATUS,
    payload: status
  };
}

export function googleLogin() {
  return async (dispatch) => {
    try {
      const user = await authorize(oAuth.google);
      try {
        const response = await fetch(`${Config.API_AUTH}/auth/google/token?access_token=${user.accessToken}`);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        dispatch({
          type: SET_LOGIN_STATUS,
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
        payload: {
          logSuccess: userDismissedLogin
        }
      });
    }
  };
}

export function facebookLogin() {
  return async (dispatch) => {
    try {
      const result = await LoginManager.logInWithReadPermissions(oAuth.facebook);
      if (!result.isCancelled) {
        try {
          const data = await AccessToken.getCurrentAccessToken();
          console.warn(data.accessToken);
          // TODO: implement GFW API login here when available
          dispatch({
            type: SET_LOGIN_STATUS,
            payload: {
              loggedIn: true,
              socialNetwork: 'facebook',
              oAuthToken: data.accessToken
            }
          });
        } catch (e) {
          console.warn(e);
          dispatch(logout());
        }
      }
    } catch (e) {
      console.error(e);
      dispatch({ type: SET_LOGIN_STATUS, payload: { logSuccess: false } });
    }
  };
}

export function logout() {
  return async (dispatch, state) => {
    dispatch({ type: RESET_STATE });
    await CookieManager.clearAll();
    if (state().user.socialNetwork === 'google') {
      dispatch({ type: LOGOUT_REQUEST });
      const tokenToRevoke = state().user.oAuthToken;
      dispatch({ type: LOGOUT_REQUEST });
      try {
        await revoke(oAuth.google, { tokenToRevoke });
      } catch (e) {
        dispatch({ type: LOGOUT_ROLLBACK });
      }
      return dispatch({ type: LOGOUT_COMMIT });
    }
    dispatch({ type: LOGOUT_REQUEST });
    return dispatch({ type: LOGOUT_COMMIT });
  };
}
