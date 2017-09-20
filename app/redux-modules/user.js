import { RESET_STATE } from '@redux-offline/redux-offline/lib/constants';
import Config from 'react-native-config';
import GoogleOAuth from 'config/oAuth/GoogleOAuth';
import { DISMISS_LOGIN_CODES } from 'config/constants/index';

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

export function loginGoogle() {
  return (dispatch) => {
    GoogleOAuth.login()
    .then((user) => {
      fetch(`${Config.API_AUTH}/auth/google/token?access_token=${user.accessToken}`)
        .then(response => {
          if (response.ok) return response.json();
          throw new Error(response.statusText);
        })
        .then(data => dispatch({
          type: SET_LOGIN_STATUS,
          payload: {
            socialNetwork: 'google',
            loggedIn: true,
            token: data.token
          }
        }))
        .catch(() => dispatch(logout()));
    })
      .catch(({ code }) => dispatch({
        type: SET_LOGIN_STATUS,
        payload: {
          logSuccess: DISMISS_LOGIN_CODES.includes(code)
        }
      }));
  };
}

export function logout() {
  return (dispatch, state) => {
    dispatch({ type: RESET_STATE });
    CookieManager.clearAll((err) => (err && console.warn(err)));
    if (state().user.socialNetwork === 'google') {
      dispatch({ type: LOGOUT_REQUEST });

      return GoogleOAuth.logout()
        .then(() => dispatch({ type: LOGOUT_COMMIT }))
        .catch(error => dispatch({ type: LOGOUT_ROLLBACK, payload: error }));
    }

    dispatch({ type: LOGOUT_REQUEST });
    return dispatch({ type: LOGOUT_COMMIT });
  };
}
