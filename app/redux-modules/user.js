import Config from 'react-native-config';

// Actions
const GET_USER = 'user/GET_USER';

// Reducer
const initialState = {
  data: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_USER:
      const user = action.payload.data.attributes;
      user.id = action.payload.data.id;
      return Object.assign({}, state, { data: user });
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
        console.warn(error);
        // To-do
      });
  };
}
