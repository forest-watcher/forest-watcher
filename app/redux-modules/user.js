import Config from 'react-native-config';
import GoogleOAuth from 'config/oAuth/GoogleOAuth';

// Actions
const GET_USER = 'user/GET_USER';
const SET_LOGIN_MODAL = 'user/SET_LOGIN_MODAL';
const SET_LOGIN_STATUS = 'user/SET_LOGIN_STATUS';
const CHECK_USER_LOGGED = 'user/CHECK_USER_LOGGED';
const LOGOUT_REQUEST = 'user/LOGOUT_REQUEST';
export const LOGOUT_COMMIT = 'user/LOGOUT_COMMIT';


// Reducer
const initialState = {
  data: {},
  loginModal: false,
  loggedIn: false,
  token: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CHECK_USER_LOGGED:
      return Object.assign({}, state, { data: action.payload });
    case GET_USER: {
      if (action.payload.data) {
        const user = action.payload.data.attributes;
        user.id = action.payload.data.id;
        return Object.assign({}, state, { data: user });
      }
      return state;
    }
    case SET_LOGIN_MODAL:
      return Object.assign({}, state, { loginModal: action.payload });
    case SET_LOGIN_STATUS:
      return Object.assign({}, state, {
        loggedIn: action.payload.loggedIn,
        token: action.payload.token
      });
    case LOGOUT_COMMIT:
      return initialState;
    default:
      return state;
  }
}

// Action Creators
export function checkLogged() {
  const url = `${Config.API_AUTH}/auth/check-logged`;
  return (dispatch, state) => {
    fetch(url, {
      headers: {
        Authorization: `Bearer ${state().user.token}`
      }
    })
      .then(response => {
        if (response.ok) return response.json();
        throw Error(response.statusText);
      })
      .then((data) => {
        dispatch({
          type: CHECK_USER_LOGGED,
          payload: data
        });
      })
      .catch((error) => {
        console.info(error);
        // To-do
      });
  };
}

export function getUser() {
  const url = `${Config.API_AUTH}/user`;
  return (dispatch, state) => {
    fetch(url, {
      headers: {
        Authorization: `Bearer ${state().user.token}`
      }
    })
      .then(response => {
        if (response.ok) return response.json();
        throw Error(response.statusText);
      })
      .then((data) => {
        dispatch({
          type: GET_USER,
          payload: data
        });
      })
      .catch((error) => {
        console.info(error);
        // To-do
      });
  };
}

export function setLoginModal(status) {
  return (dispatch) => {
    dispatch({
      type: SET_LOGIN_MODAL,
      payload: status
    });
  };
}

export function setLoginStatus(status) {
  return (dispatch) => {
    dispatch({
      type: SET_LOGIN_STATUS,
      payload: status
    });
  };
}

export function logout() {
  return async (dispatch) => {
    dispatch({
      type: LOGOUT_REQUEST,
      meta: {
        offline: { // TODO: save the user login method and logout from it
          // returning 400 code it won't attemp again (https://github.com/jevakallio/redux-offline#giving-up-is-hard-to-do)
          effect: { promise: GoogleOAuth.logout(), errorCode: 400 },
          commit: { type: LOGOUT_COMMIT },
          rollback: { type: LOGOUT_COMMIT }
        }
      }
    });
  };
}
