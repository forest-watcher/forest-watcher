import Config from 'react-native-config';

// Actions
const GET_USER = 'user/GET_USER';
const SET_LOGIN_MODAL = 'user/SET_LOGIN_MODAL';
const SET_LOGIN_STATUS = 'user/SET_LOGIN_STATUS';

// Reducer
const initialState = {
  data: null,
  loginModal: false,
  loggedIn: false,
  token: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_USER: {
      const user = action.payload.data.attributes;
      user.id = action.payload.data.id;
      return Object.assign({}, state, { data: user });
    }
    case SET_LOGIN_MODAL:
      return Object.assign({}, state, { loginModal: action.payload });
    case SET_LOGIN_STATUS:
      return Object.assign({}, state, {
        loggedIn: action.payload.loggedIn,
        token: action.payload.token
      });
    default:
      return state;
  }
}

// Action Creators
export function getUser() {
  const url = `${Config.API_URL}/user`;
  return (dispatch) => {
    fetch(url)
      .then(response => response.json())
      .then((data) => {
        dispatch({
          type: GET_USER,
          payload: data
        });
      })
      .catch((error) => {
        console.log(error);
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
    console.log(status);

    dispatch({
      type: SET_LOGIN_STATUS,
      payload: status
    });
  };
}
