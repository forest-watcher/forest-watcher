import Config from 'react-native-config';
import GoogleOAuth from 'config/oAuth/GoogleOAuth';

// Actions
const SET_USER = 'user/SET_USER';
const SET_LOGIN_STATUS = 'user/SET_LOGIN_STATUS';
const LOGOUT_REQUEST = 'user/LOGOUT_REQUEST';
export const LOGOUT_COMMIT = 'user/LOGOUT_COMMIT';


// Reducer
const initialState = {
  data: {},
  loggedIn: false,
  token: null,
  socialNetwork: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER: {
      if (action.payload.data) {
        const user = action.payload.data.attributes;
        user.id = action.payload.data.id;
        return Object.assign({}, state, { data: user });
      }
      return state;
    }
    case SET_LOGIN_STATUS:
      return Object.assign({}, state, { ...action.payload });
    case LOGOUT_COMMIT:
      return initialState;
    default:
      return state;
  }
}

// Action Creators
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
          type: SET_USER,
          payload: data
        });
      })
      .catch((error) => {
        console.info(error);
        // To-do
      });
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
        .catch((error) => {
          console.warn(error);
        });
    });
  };
}

export function logout() {
  return (dispatch, state) => {
    if (state().user.socialNetwork === 'google') {
      return {
        type: LOGOUT_REQUEST,
        meta: {
          offline: {
            effect: { promise: GoogleOAuth.logout() },
            commit: { type: LOGOUT_COMMIT }
          }
        }
      };
    }
    return {
      type: LOGOUT_COMMIT
    };
  };
}
