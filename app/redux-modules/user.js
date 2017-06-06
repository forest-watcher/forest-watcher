import Config from 'react-native-config';
import GoogleOAuth from 'config/oAuth/GoogleOAuth';

// Actions
const GET_USER_REQUEST = 'user/GET_USER_REQUEST';
const GET_USER_COMMIT = 'user/GET_USER_COMMIT';
const SET_LOGIN_STATUS = 'user/SET_LOGIN_STATUS';
export const LOGOUT_REQUEST = 'user/LOGOUT_REQUEST';
const LOGOUT_COMMIT = 'user/LOGOUT_COMMIT';

// Reducer
const initialState = {
  data: {},
  loggedIn: false,
  token: null,
  socialNetwork: null,
  logoutSuccess: true
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_USER_COMMIT: {
      if (action.payload.data) {
        const user = action.payload.data.attributes;
        user.id = action.payload.data.id;
        return Object.assign({}, state, { data: user });
      }
      return state;
    }
    case SET_LOGIN_STATUS:
      return Object.assign({}, state, { ...action.payload });
    case LOGOUT_REQUEST:
      return { ...initialState, logoutSuccess: false };
    case LOGOUT_COMMIT:
      return { ...initialState, logoutSuccess: true };
    default:
      return state;
  }
}

// Action Creators
export function getUser() {
  return {
    type: GET_USER_REQUEST,
    meta: {
      offline: {
        effect: { url: `${Config.API_AUTH}/user` },
        commit: { type: GET_USER_COMMIT }
      }
    }
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
        .catch(() => {
          GoogleOAuth.reset();
        });
    });
  };
}

export function logout() {
  return (dispatch, state) => {
    if (state().user.socialNetwork === 'google') {
      return dispatch({
        type: LOGOUT_REQUEST,
        meta: {
          offline: {
            effect: { promise: GoogleOAuth.logout() },
            commit: { type: LOGOUT_COMMIT }
          }
        }
      });
    }
    return dispatch({
      type: LOGOUT_COMMIT
    });
  };
}
